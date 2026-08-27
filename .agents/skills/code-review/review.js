export const meta = {
  name: 'code-review',
  description: 'Review a diff with one agent per rule, then verify every blocking finding',
  phases: [
    { title: 'Review', detail: 'one agent per rule' },
    { title: 'Verify', detail: 'refute each blocking finding' },
    { title: 'Group', detail: 'one row per root cause' },
  ],
}

const { base = 'origin/main' } = args || {}

const SEVERITIES = ['blocker', 'major', 'minor']

const SCOPE = `Review only the diff of \`git diff ${base}...HEAD\`, and read the surrounding code to
judge it. Judge the code quality of the behavior the diff implements — do not invent future
requirements or demand unrelated cleanup. Treat behavior changes as intentional unless they
contradict the changed design.

Report findings only; another agent applies the fixes. File each defect once, at its cause, never at
its symptoms. Severity is what merging costs: blocker — wrong behavior, or a design the next change
has to undo; major — right behavior, wrong shape; minor — local and cosmetic.

The bar under every rule is line count: the fewest lines that do the job, read top to bottom without
backtracking. A fix that deletes more than it adds is the best kind — name the lines it deletes.
"There is no shorter way" is a claim to check against a library, a repo helper or a simpler
formulation, never one to assume.`

const skillBar = name =>
  `Read the ${name} skill — \`.agents/skills/${name}/SKILL.md\` from the repo root, or locate it with
\`find . -path '*/${name}/SKILL.md'\` — and apply it as this rule's bar. If you cannot read that file,
return \`unavailable: true\` with no findings rather than reviewing from memory.`

const RULES = {
  kiss: [
    skillBar('kiss'),
    `Judge the diff whole before its parts: whether this behavior needs this many files, units and
moving parts, and name any that should not exist. Then in each unit find every line, branch,
parameter, layer and abstraction that can go while behavior stays identical. Name what breaks if it
goes; if nothing breaks, it is a finding.`,
  ],
  'folder-structure': [
    skillBar('folder-structure'),
    `Check every file the diff adds, renames or moves: folder per export, kebab-case, file name
matching the export, nesting by usage, colocated tests.`,
  ],
  solid: `Judge responsibility and dependency direction. One unit, one reason to change. Behavior
belongs to the layer that owns the decision; details depend on policies, never the reverse. Flag
units that mix orchestration with mechanics, callers that reach past their neighbour to a detail
behind it, and anything that cannot be tested without standing up what it depends on.`,
  composition: `Flag configuration where composition belongs: a unit steered by flags, modes,
options or booleans instead of being assembled from smaller pieces the caller picks. Every boolean
parameter that selects behavior is a finding, as is a second parameter for a concern a first one
already covers.`,
  dry: `Find the same decision written twice — duplicated logic, a constant re-derived, a list that
must be kept in step with another. Judge it by the cause: two spellings of one rule is a finding;
two things that merely look alike today are not, and factoring them together is the worse defect.`,
  'reinventing-the-wheel': `Find code that reimplements what a dependency already in package.json,
the language, the framework or an existing helper in this repo does. Search before concluding it is
new. Name the replacement and the lines it deletes.`,
  spaghetti: `Trace each changed unit top to bottom once. Every jump backwards, or out to another
file, to learn what a value holds is a finding. Flag control flow a reader has to simulate, negated
or nested conditions that could read positively, names that do not say what the thing is, magic
values, swallowed errors, mutation of shared state, and comments that restate the code.`,
  tests: `Judge whether the tests cover the behavior this diff changes. Changed behavior with no
test is a blocker. Flag tests that assert implementation details instead of behavior, and tests that
pass whether or not the guard they name is present.`,
}

const FINDINGS = rule => ({
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'file', 'issue', 'fix'],
        properties: {
          severity: { type: 'string', enum: SEVERITIES },
          file: { type: 'string' },
          line: { type: 'number' },
          issue: { type: 'string', description: 'the defect and why it matters' },
          fix: { type: 'string', description: 'the smallest change that removes the cause' },
          tldr: { type: 'string', description: 'the defect in under twelve words' },
        },
      },
    },
    ...(Array.isArray(RULES[rule]) && {
      unavailable: { type: 'boolean', description: `the ${rule} skill could not be read` },
    }),
  },
})

const REFUTATION = {
  type: 'object',
  required: ['refuted', 'reason'],
  properties: { refuted: { type: 'boolean' }, reason: { type: 'string' } },
}

const GROUPS = {
  type: 'object',
  required: ['groups'],
  properties: {
    groups: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'number' },
        description: 'indexes of findings one fix resolves together',
      },
    },
  },
}

const blocking = f => f.severity === 'blocker'

const label = f => `${f.rule} — ${f.file}:${f.line ?? '?'}`

const refute = f =>
  agent(
    `${SCOPE}\n\nTry to refute this finding: [${f.severity}] ${label(f)} — ${f.issue}\nIts fix: ${f.fix}\n` +
      `Read the code. Refute it if it misreads the diff, is already handled elsewhere, or is out of ` +
      `scope. Default to refuted:true when uncertain — but where the fix deletes more than it adds, ` +
      `refute it only by naming what breaks if it goes. Reading well, naming a concept or possible ` +
      `future reuse are not breakages.`,
    { label: `verify:${label(f)}`, phase: 'Verify', schema: REFUTATION }
  ).then(r => ({ ...f, ...(r ?? { unverified: true }) }))

const ruleResults = await pipeline(
  Object.keys(RULES),
  rule =>
    agent([SCOPE, RULES[rule]].flat().join('\n\n'), {
      label: rule,
      phase: 'Review',
      schema: FINDINGS(rule),
    }),
  (result, rule) => {
    if (!result || result.unavailable) return { rule, reviewed: false, findings: [] }
    return parallel(
      result.findings.map(f => () => (blocking(f) ? refute({ ...f, rule }) : { ...f, rule }))
    ).then(findings => ({ rule, reviewed: true, findings }))
  }
)

const unreviewedRules = ruleResults.filter(r => !r.reviewed).map(r => r.rule)
const all = ruleResults.flatMap(r => r.findings)
const kept = all.filter(f => !f.refuted)
const unverified = kept.filter(f => f.unverified)
const incomplete = unreviewedRules.length > 0 || unverified.length > 0

if (incomplete)
  log(`fail forced — unreviewed: ${unreviewedRules.join(', ') || 'none'}; unverified: ${unverified.length}`)

const bySeverity = (a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity)

const listing = kept.map((f, i) => `${i}. [${f.severity}] ${label(f)} — ${f.issue}`).join('\n')

const grouped =
  kept.length > 1 &&
  (await agent(
    `${SCOPE}\n\n${Object.keys(RULES).length} reviewers judged this diff without seeing each other, ` +
      `so one defect often appears many times over.\n\n${listing}\n\n` +
      `Group the findings one fix would resolve together. Sharing a file, a layer or a theme is not ` +
      `sharing a cause: group them only if fixing the defect one describes would leave the others ` +
      `with nothing left to report. Give every index exactly once; a lone cause is a group of one.`,
    { label: 'group', phase: 'Group', schema: GROUPS }
  ))

const seen = new Set()
const groups = []
for (const group of grouped ? grouped.groups : []) {
  const members = group.filter(i => kept[i] && !seen.has(i))
  members.forEach(i => seen.add(i))
  if (members.length) groups.push(members)
}
kept.forEach((_, i) => seen.has(i) || groups.push([i]))

return {
  verdict: incomplete || kept.some(blocking) ? 'fail' : 'pass',
  unreviewedRules,
  findings: groups
    .map(indexes => indexes.map(i => kept[i]).sort(bySeverity))
    .map(([primary, ...rest]) => ({
      ...primary,
      ...(rest.length && { corroboratedBy: rest.map(label) }),
    }))
    .sort(bySeverity)
    .map(({ refuted, reason, ...f }) => f),
  dropped: all.filter(f => f.refuted).map(({ refuted, ...f }) => f),
}
