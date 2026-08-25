export const meta = {
  name: 'code-review',
  description: 'Review a diff with one agent per rule, then verify the blocking findings',
  phases: [
    { title: 'Review', detail: 'one agent per rule' },
    { title: 'Verify', detail: 'refute each blocking finding' },
  ],
}

const { base = 'origin/main', skills = '.agents/skills' } = args || {}

const SEVERITIES = ['P0', 'P1', 'P2', 'P3']
const BLOCKING = ['P0', 'P1']

const SCOPE = `Review only the diff of \`git diff ${base}...HEAD\`. Judge the code quality of the
behavior it implements — do not invent future requirements or demand unrelated cleanup.
Report findings only; another agent applies the fixes.`

const RULES = [
  {
    key: 'kiss',
    prompt: `Read ${skills}/kiss/SKILL.md and apply it as your only bar. Find every line, branch,
parameter, layer and abstraction in the diff that can be removed while behavior stays identical.
For each, name what breaks if it is removed — if nothing breaks, it is a finding.`,
  },
  {
    key: 'folder-structure',
    prompt: `Read ${skills}/folder-structure/SKILL.md and apply it as your only bar. Check every
file the diff adds, renames or moves: folder per export, kebab-case, file name matching the
export, nesting by usage, colocated tests.`,
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
  ).then(v => ({ ...f, verified: Boolean(v), refuted: Boolean(v && v.refuted) }))

const reviewed = await pipeline(
  RULES,
  rule => agent(`${SCOPE}\n\n${rule.prompt}`, { label: rule.key, phase: 'Review', schema: FINDINGS }),
  (result, rule) => {
    if (!result) return { rule: rule.key, failed: true, findings: [] }
    const found = result.findings.map(f => ({ ...f, rule: rule.key }))
    return parallel(found.filter(blocking).map(f => () => refute(f))).then(checked => ({
      rule: rule.key,
      failed: false,
      findings: [...checked, ...found.filter(f => !blocking(f)).map(f => ({ ...f, verified: false }))],
    }))
  }
)

const reviews = reviewed.filter(Boolean)
const failed = RULES.length - reviews.filter(r => !r.failed).length
const findings = reviews.flatMap(r => r.findings).filter(f => !f.refuted)

const unverified = findings.filter(f => !f.verified).length
if (unverified) log(`${unverified} P2/P3 findings reported without a verify pass`)
if (failed) log(`${failed} of ${RULES.length} rules returned nothing — verdict forced to fail`)

findings.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity))

return {
  verdict: failed || findings.some(blocking) ? 'fail' : 'pass',
  findings: findings.map(({ refuted, ...f }) => f),
}
