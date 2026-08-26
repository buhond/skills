export const meta = {
  name: 'code-review',
  description: 'Review a diff with one agent per rule, then verify the blocking findings',
  phases: [
    { title: 'Review', detail: 'one agent per rule' },
    { title: 'Verify', detail: 'refute each blocking finding' },
  ],
}

const { base = 'origin/main' } = args || {}

const SEVERITIES = ['P0', 'P1', 'P2', 'P3']
const COST = { P0: 25, P1: 15, P2: 5, P3: 2 }
const BLOCKING = ['P0', 'P1']

const SCOPE = `Review only the diff of \`git diff ${base}...HEAD\`. Judge the code quality of the
behavior it implements — do not invent future requirements or demand unrelated cleanup.
Treat behavior changes as intentional unless they contradict the changed design.
Prefer one root cause over several symptoms of it.
Report findings only; another agent applies the fixes.

Severity:
P0 — incorrect architecture or behavior with regression risk.
P1 — design flaw that should block merge. An abstraction added without present need, more code
or state than the feature requires, duplicate logic left when consolidation is straightforward,
a symptom-level patch over a live root cause, or changed behavior with no test are all P1 or worse.
P2 — meaningful maintainability or clarity issue.
P3 — minor issue that does not threaten the design.`

const read = name =>
  `Read the ${name} skill — \`.agents/skills/${name}/SKILL.md\` from the repo root, or locate it
with \`find . -path '*/${name}/SKILL.md'\` — and apply it as your only bar. If you cannot find and
read that file, report a P0 finding saying so rather than reviewing from memory.`

const RULES = [
  {
    key: 'kiss',
    prompt: `${read('kiss')} Find every line, branch, parameter, layer and abstraction in the diff
that can be removed while behavior stays identical. For each, name what breaks if it is removed —
if nothing breaks, it is a finding.`,
  },
  {
    key: 'folder-structure',
    prompt: `${read('folder-structure')} Check every file the diff adds, renames or moves: folder
per export, kebab-case, file name matching the export, nesting by usage, colocated tests.`,
  },
  {
    key: 'bad-patterns',
    prompt: `Find bad patterns in the diff: duplicated logic, dead code, swallowed errors, mutation
of shared state, misleading names, magic values, a symptom-level patch over a root cause,
copy-paste shaped or prematurely generalized code.`,
  },
  {
    key: 'architecture',
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
    prompt: `Judge readability and naming: names that do not say what the thing is, inverted or
nested conditions that could read positively, comments that restate the code, and anything a
reader has to hold in their head to follow.`,
  },
]

const FINDINGS = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'file', 'line', 'issue', 'fix'],
        properties: {
          severity: { enum: SEVERITIES },
          file: { type: 'string' },
          line: { type: 'number' },
          issue: { type: 'string', description: 'the defect and why it matters' },
          fix: { type: 'string', description: 'smallest change that removes the cause' },
        },
      },
    },
  },
}

const REFUTATION = {
  type: 'object',
  required: ['refuted', 'reason'],
  properties: {
    refuted: { type: 'boolean' },
    reason: { type: 'string' },
  },
}

const blocking = f => BLOCKING.includes(f.severity)

const refute = f =>
  agent(
    `${SCOPE}\n\nTry to refute this finding: [${f.severity}] ${f.file}:${f.line} — ${f.issue}\n` +
      `Read the code. Refute it if it misreads the diff, is already handled elsewhere, or is ` +
      `out of scope. Default to refuted:true when uncertain.`,
    { label: `verify:${f.rule}:${f.file}:${f.line}`, phase: 'Verify', schema: REFUTATION }
  ).then(refutation => {
    const answered = Boolean(refutation)
    return { ...f, verified: answered, refuted: answered && refutation.refuted }
  })

const reviewed = await pipeline(
  RULES,
  rule => agent(`${SCOPE}\n\n${rule.prompt}`, { label: rule.key, phase: 'Review', schema: FINDINGS }),
  (result, rule) => {
    if (!result) return { died: true, findings: [] }
    const found = result.findings.map(f => ({ ...f, rule: rule.key }))
    const toVerify = found.filter(blocking)
    const rest = found.filter(f => !blocking(f))
    return parallel(toVerify.map(f => () => refute(f))).then(verified => ({
      died: false,
      findings: [...verified, ...rest],
    }))
  }
)

const deadRules = reviewed.filter(r => r.died).length
const findings = reviewed.flatMap(r => r.findings).filter(f => !f.refuted)

const unverified = findings.filter(f => blocking(f) && !f.verified).length
if (unverified) log(`${unverified} blocking findings kept without a verify pass — the refute agent died`)
if (deadRules) log(`${deadRules} of ${RULES.length} rules returned nothing — verdict forced to fail`)

findings.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity))

return {
  verdict: deadRules || findings.some(blocking) ? 'fail' : 'pass',
  score: deadRules ? null : Math.max(0, 100 - findings.reduce((n, f) => n + COST[f.severity], 0)),
  findings: findings.map(({ refuted, ...f }) => f),
}
