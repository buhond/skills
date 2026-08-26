export const meta = {
  name: 'code-review',
  description: 'Review a diff with one agent per rule, then verify the blocking findings',
  phases: [
    { title: 'Review', detail: 'one agent per rule' },
    { title: 'Verify', detail: 'refute each blocking finding' },
    { title: 'Cluster', detail: 'group findings that share a root cause' },
  ],
}

const { base = 'origin/main' } = args || {}

const SEVERITIES = ['P0', 'P1', 'P2', 'P3']
const SCORE_PENALTY = { P0: 25, P1: 15, P2: 5, P3: 2 }

const DIFF_SCOPE = `Review only the diff of \`git diff ${base}...HEAD\`. Judge the code quality of the
behavior it implements — do not invent future requirements or demand unrelated cleanup.
Treat behavior changes as intentional unless they contradict the changed design.
Prefer one root cause over several symptoms of it.`

const REVIEW_SCOPE = `${DIFF_SCOPE}
Report findings only; another agent applies the fixes.

Severity:
P0 — incorrect architecture or behavior with regression risk.
P1 — design flaw that should block merge. An abstraction added without present need, more code
or state than the feature requires, an option or parameter where composition would do, duplicate
logic left when consolidation is straightforward, a symptom-level patch over a live root cause,
or changed behavior with no test are all P1 or worse.
P2 — meaningful maintainability or clarity issue that no deletion would fix.
P3 — local and cosmetic, with no consequence for the design.

Grade a finding by its cause, not by how it looks: code that reads badly because it carries code,
state or indirection the feature does not need is that removal's severity, not a cosmetic one.
File each defect once, at that severity. Do not restate a finding you already filed as a second,
smaller one about the same cause elsewhere.`

const SIZE_BAR = `The bar before all others is line count: the fewest lines that do the job, read
top to bottom without backtracking. Every finding whose fix is a removal names the lines it deletes.
Prefer composing small pieces over configuring one piece with options, flags or modes. When a unit is
long, find the shorter route before accepting it: a library, framework affordance or repo helper that
already does the work,
or a formulation with fewer moving parts. "There is no shorter way" is a claim to check,
never one to assume. Control flow a reader has to simulate — state mutated at a distance from where
it is read, a value threaded through layers that do not use it, a branch whose condition encodes a
caller you must go find — is a design defect, not a matter of taste.`

const readSkill = name =>
  `Read the ${name} skill — \`.agents/skills/${name}/SKILL.md\` from the repo root, or locate it
with \`find . -path '*/${name}/SKILL.md'\` — and apply it as the bar for this rule. If you cannot
find and read that file, return \`unavailable: true\` with no findings rather than reviewing from memory.`

const RULES = [
  {
    key: 'kiss',
    skill: 'kiss',
    sizeBar: true,
    prompt: `Judge the diff as a whole before its parts: whether the behavior it adds needs this many
files, units and moving parts, and name any file or unit that should not exist. Then within each unit
find every line, branch, parameter, layer and abstraction that can be removed while behavior stays
identical — name what breaks if it goes, and if nothing breaks it is a finding.`,
  },
  {
    key: 'folder-structure',
    skill: 'folder-structure',
    prompt: `Check every file the diff adds, renames or moves: folder
per export, kebab-case, file name matching the export, nesting by usage, colocated tests.`,
  },
  {
    key: 'bad-patterns',
    sizeBar: true,
    prompt: `Find bad patterns in the diff: duplicated logic, dead code, swallowed errors, mutation
of shared state, misleading names, magic values, a symptom-level patch over a root cause,
copy-paste shaped or prematurely generalized code.`,
  },
  {
    key: 'architecture',
    sizeBar: true,
    prompt: `Judge ownership and dependency direction. Behavior belongs in the layer that owns the
decision; details depend on policies, never the reverse. One source of truth per decision,
dependency and state transition. Flag abstractions that mix orchestration with mechanics.`,
  },
  {
    key: 'tests',
    prompt: `Judge whether the tests cover the behavior this diff changes. Find changed behavior
with no test, and tests that assert implementation details instead of behavior.`,
  },
  {
    key: 'readability',
    sizeBar: true,
    prompt: `Judge readability and naming: names that do not say what the thing is, inverted or
nested conditions that could read positively, and comments that restate the code. Trace each
changed unit top to bottom once: every jump backwards, or out to another file, to learn what a
value holds is a finding.`,
  },
]

const FINDING = {
  type: 'object',
  required: ['severity', 'file', 'issue', 'fix'],
  properties: {
    severity: { type: 'string', enum: SEVERITIES },
    file: { type: 'string' },
    line: { type: 'number' },
    issue: { type: 'string', description: 'the defect and why it matters' },
    fix: {
      type: 'string',
      description:
        'smallest change that removes the cause — for architectural findings, the smallest ' +
        'change that restores correct ownership and dependency direction, not the smallest diff',
    },
  },
}

const findingsSchema = rule => ({
  type: 'object',
  required: ['findings'],
  properties: {
    findings: { type: 'array', items: FINDING },
    ...(rule.skill && {
      unavailable: {
        type: 'boolean',
        description: `the ${rule.skill} skill could not be read — do not review from memory`,
      },
    }),
  },
})

const REFUTATION = {
  type: 'object',
  required: ['refuted', 'reason'],
  properties: {
    refuted: { type: 'boolean' },
    reason: { type: 'string' },
  },
}

const CLUSTERS = {
  type: 'object',
  required: ['clusters'],
  properties: {
    clusters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['rootCause', 'findings'],
        properties: {
          rootCause: {
            type: 'string',
            description: 'the one defect every finding in this group describes',
          },
          findings: {
            type: 'array',
            items: { type: 'number' },
            description: 'indexes from the numbered list',
          },
        },
      },
    },
  },
}

const blocking = f => f.severity === 'P0' || f.severity === 'P1'

const refute = f =>
  agent(
    `${DIFF_SCOPE}\n\nTry to refute this finding: [${f.severity}] ${f.file}:${f.line} — ${f.issue}\n` +
      `Its fix: ${f.fix}\n` +
      `Read the code. Refute it if it misreads the diff, is already handled elsewhere, or is ` +
      `out of scope. Default to refuted:true when uncertain — but where the fix is to remove code, ` +
      `refute it only by naming what breaks if it goes. Reading well, naming a concept or possible ` +
      `future reuse are not breakages; if you cannot name one, keep the finding.`,
    { label: `verify:${f.rule}:${f.file}:${f.line}`, phase: 'Verify', schema: REFUTATION }
  ).then(refutation => ({ ...f, ...(refutation ?? { unverified: true }) }))

const ruleResults = await pipeline(
  RULES,
  rule =>
    agent([REVIEW_SCOPE, rule.sizeBar && SIZE_BAR, rule.skill && readSkill(rule.skill), rule.prompt]
      .filter(Boolean)
      .join('\n\n'), {
      label: rule.key,
      phase: 'Review',
      schema: findingsSchema(rule),
    }),
  (result, rule) => {
    if (!result || result.unavailable) return { rule: rule.key, reviewed: false, findings: [] }
    const verified = result.findings.map(f => () => {
      const found = { ...f, rule: rule.key }
      return blocking(found) ? refute(found) : found
    })
    return parallel(verified).then(findings => ({ rule: rule.key, reviewed: true, findings }))
  }
)

const unreviewedRules = ruleResults.filter(r => !r.reviewed).map(r => r.rule)
const allFindings = ruleResults.flatMap(r => r.findings)
const kept = allFindings.filter(f => !f.refuted)
const dropped = allFindings.filter(f => f.refuted)
const unverified = kept.filter(f => f.unverified)
const incomplete = unreviewedRules.length > 0 || unverified.length > 0

if (incomplete)
  log(
    `${unreviewedRules.length} of ${RULES.length} rules went unreviewed (${unreviewedRules.join(', ') || 'none'}) ` +
      `and ${unverified.length} findings went unverified — verdict forced to fail`
  )

const bySeverity = (a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity)
kept.sort(bySeverity)

const label = f => `${f.rule} — ${f.file}:${f.line ?? '?'}`

const groupByRootCause = async findings => {
  const listing = findings.map((f, i) => `${i}. [${f.severity}] ${label(f)} — ${f.issue}`).join('\n')

  const result =
    findings.length > 1 &&
    (await agent(
      `${DIFF_SCOPE}\n\n${RULES.length} reviewers judged this diff independently and never saw each ` +
        `other's findings, so one defect is often reported many times — in different words, at ` +
        `different severities, and from the files on either side of it.\n\n${listing}\n\n` +
        `Group the findings that one fix would resolve together. Sharing a file, a layer or a theme ` +
        `is not sharing a cause: group them only if fixing the defect one describes would leave the ` +
        `others with nothing left to report. Give every index exactly once; a finding whose cause no ` +
        `other finding shares is a group of one.`,
      { label: 'cluster', phase: 'Cluster', schema: CLUSTERS }
    ))

  const seen = new Set()
  const groups = []
  for (const cluster of result ? result.clusters : []) {
    const members = cluster.findings.filter(i => findings[i] && !seen.has(i))
    members.forEach(i => seen.add(i))
    if (members.length) groups.push(members)
  }
  findings.forEach((_, i) => seen.has(i) || groups.push([i]))
  return groups
}

const groups = (await groupByRootCause(kept))
  .map(indexes => indexes.map(i => kept[i]).sort(bySeverity))
  .map(([primary, ...corroborating]) => ({
    ...primary,
    ...(corroborating.length && { corroboratedBy: corroborating.map(label) }),
  }))
  .sort(bySeverity)

return {
  verdict: incomplete || kept.some(blocking) ? 'fail' : 'pass',
  score: incomplete ? null : Math.max(0, 100 - groups.reduce((n, f) => n + SCORE_PENALTY[f.severity], 0)),
  unreviewedRules,
  findings: groups.map(({ refuted, reason, ...f }) => f),
  dropped: dropped.map(({ refuted, ...f }) => f),
}
