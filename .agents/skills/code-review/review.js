export const meta = {
  name: 'code-review',
  description: 'Review a diff with one agent per rule, then verify the blocking findings',
  phases: [
    { title: 'Review', detail: 'one agent per rule' },
    { title: 'Verify', detail: 'refute each blocking finding' },
  ],
}

const base = (args && args.base) || 'origin/main'
const skills = (args && args.skills) || '.agents/skills'

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
          severity: { enum: ['P0', 'P1', 'P2', 'P3'] },
          file: { type: 'string' },
          line: { type: 'number' },
          issue: { type: 'string', description: 'the defect and why it matters' },
          fix: { type: 'string', description: 'smallest change that removes the cause' },
        },
      },
    },
    tradeoff: { type: 'string', description: 'the central design tradeoff in this diff' },
  },
}

const VERDICT = {
  type: 'object',
  required: ['refuted', 'reason'],
  properties: {
    refuted: { type: 'boolean' },
    reason: { type: 'string' },
  },
}

const blocking = f => f.severity === 'P0' || f.severity === 'P1'

const reviewed = await pipeline(
  RULES,
  rule => agent(`${SCOPE}\n\n${rule.prompt}`, { label: rule.key, phase: 'Review', schema: FINDINGS }),
  (result, rule) => {
    if (!result) return { rule: rule.key, tradeoff: null, findings: [] }
    const found = result.findings.map(f => ({ ...f, rule: rule.key }))
    return parallel(
      found.filter(blocking).map(f => () =>
        agent(
          `${SCOPE}\n\nTry to refute this finding: [${f.severity}] ${f.file}:${f.line} — ${f.issue}\n` +
            `Read the code. Refute it if it misreads the diff, is already handled elsewhere, or is ` +
            `out of scope. Default to refuted:true when uncertain.`,
          { label: `verify:${rule.key}:${f.line}`, phase: 'Verify', schema: VERDICT }
        ).then(v => ({ ...f, refuted: !v || v.refuted, why: v && v.reason }))
      )
    ).then(verified => ({
      rule: rule.key,
      tradeoff: result.tradeoff,
      findings: [...verified.filter(Boolean), ...found.filter(f => !blocking(f))],
    }))
  }
)

const reviews = reviewed.filter(Boolean)
const findings = reviews.flatMap(r => r.findings).filter(f => !f.refuted)

const skipped = findings.filter(f => !blocking(f)).length
if (skipped) log(`${skipped} P2/P3 findings reported without a verify pass`)
const missing = RULES.length - reviews.length
if (missing) log(`${missing} of ${RULES.length} rules returned nothing`)

const order = { P0: 0, P1: 1, P2: 2, P3: 3 }
findings.sort((a, b) => order[a.severity] - order[b.severity])

return {
  verdict: findings.some(blocking) ? 'fail' : 'pass',
  findings,
  tradeoffs: reviews.filter(r => r.tradeoff).map(r => `${r.rule}: ${r.tradeoff}`),
}
