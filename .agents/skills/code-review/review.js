export const meta = {
  name: 'code-review',
  description: 'Review a diff with one agent per rule, then verify every blocking finding',
  phases: [
    { title: 'Review', detail: 'one agent per rule' },
    { title: 'Verify', detail: 'refute each blocker' },
    { title: 'Group', detail: 'one row per root cause' },
  ],
}

const { base = 'origin/main' } = args || {}

const SEVERITIES = ['blocker', 'major', 'minor']

const scope = `
Review \`git diff ${base}...HEAD\`, reading the code around it.

Judge the code, not the product decision: the behavior is intentional, and unrelated cleanup is out
of scope. Report findings only — another agent fixes them. File each defect once, at its cause.

- blocker: wrong behavior, or a design the next change has to undo.
- major: right behavior, wrong shape.
- minor: local and cosmetic.

The bar under every rule: the fewest lines that do the job, read top to bottom without backtracking.
The best fix deletes more than it adds, so name the lines yours deletes — and before calling code
irreducible, look for a library, a repo helper or a simpler formulation.
`

const useSkill = (name) => `
This rule's bar is the ${name} skill: read \`.agents/skills/${name}/SKILL.md\`, or find it with
\`find . -path '*/${name}/SKILL.md'\`. Cannot read it? Return \`unavailable: true\` rather than
review from memory.
`

const rules = {
  kiss: `
    ${useSkill('kiss')}

    Start with the whole: does this behavior need this many files and moving parts? Then in each
    unit, find every line, branch, parameter and layer that could go with behavior unchanged. If
    nothing breaks when it goes, it is a finding.
  `,

  'folder-structure': `
    ${useSkill('folder-structure')}

    Check every file the diff adds, renames or moves: folder per export, kebab-case, file named
    after its export, nested by usage, tests alongside.
  `,

  solid: `
    One unit, one reason to change. Each decision belongs to the layer that owns it, and details
    depend on policies rather than the reverse.

    Flag units mixing orchestration with mechanics, callers reaching past a neighbour to the detail
    behind it, and anything untestable without standing up its dependencies.
  `,

  composition: `
    Flag units steered by flags, modes or options where the caller should instead assemble smaller
    pieces. Every boolean parameter that picks behavior is a finding.
  `,

  dry: `
    Find one decision written twice: duplicated logic, a re-derived constant, two lists that must
    stay in step.

    Judge by cause, not shape — folding together two things that merely look alike today is the
    worse defect.
  `,

  'no-reinvention': `
    Find code redoing what the language, the framework, a package.json dependency or an existing
    repo helper already does. Search before concluding something is new, then name the replacement.
  `,

  'no-spaghetti': `
    Read each changed unit top to bottom once. Every jump backwards, or out to another file, to
    learn what a value holds is a finding.

    Flag control flow you have to simulate, conditions that could read positively, names that hide
    what the thing is, magic values, swallowed errors, shared mutable state, comments restating code.
  `,

  'test-coverage': `
    Changed behavior with no test is a blocker. Flag tests asserting implementation instead of
    behavior, and tests that pass whether or not the guard they name is there.
  `,
}

const refutation = (finding) => `
${scope}

Read the code, then try to refute this finding:

[${finding.severity}] ${finding.rule} — ${finding.file}:${finding.line ?? '?'}
${finding.issue}
Its fix: ${finding.fix}

Refute it if it misreads the diff, is already handled elsewhere, or is out of scope, and default to
\`refuted: true\` when unsure. Where its fix deletes more than it adds, refute it only by naming what
breaks — reading well, naming a concept and future reuse are not breakages.
`

const grouping = (listing) => `
${scope}

${Object.keys(rules).length} reviewers judged this diff blind to each other, so one defect often
appears many times over.

${listing}

Group the findings one fix would resolve together — not those sharing a file or a theme, but those
where fixing one leaves the others with nothing to report. Give every index exactly once; a lone
cause is a group of one.
`

const findings = (rule) => ({
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'tldr', 'file', 'issue', 'fix'],
        properties: {
          severity: { type: 'string', enum: SEVERITIES },
          tldr: { type: 'string', description: 'the defect in under twelve words' },
          file: { type: 'string' },
          line: { type: 'number' },
          issue: { type: 'string', description: 'the defect and why it matters' },
          fix: { type: 'string', description: 'the smallest change that removes the cause' },
        },
      },
    },
    ...(rules[rule].includes('SKILL.md') && {
      unavailable: { type: 'boolean', description: `the ${rule} skill could not be read` },
    }),
  },
})

const refuted = {
  type: 'object',
  required: ['refuted', 'reason'],
  properties: { refuted: { type: 'boolean' }, reason: { type: 'string' } },
}

const groups = {
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

const label = (finding) => `${finding.rule} — ${finding.file}:${finding.line ?? '?'}`

const bySeverity = (a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity)

const blocks = (finding) => finding.severity === 'blocker'

const verify = (finding) =>
  agent(refutation(finding), {
    label: `verify:${label(finding)}`,
    phase: 'Verify',
    schema: refuted,
  }).then((verdict) => ({ ...finding, ...(verdict ?? { unverified: true }) }))

const reviewed = await pipeline(
  Object.keys(rules),
  (rule) =>
    agent(`${scope}\n${rules[rule]}`, { label: rule, phase: 'Review', schema: findings(rule) }),
  (result, rule) => {
    if (!result || result.unavailable) return { rule, read: false, findings: [] }

    const judged = result.findings
      .map((finding) => ({ ...finding, rule }))
      .map((finding) => () => (blocks(finding) ? verify(finding) : finding))

    return parallel(judged).then((findings) => ({ rule, read: true, findings }))
  },
)

const unreviewedRules = reviewed.filter((rule) => !rule.read).map((rule) => rule.rule)
const all = reviewed.flatMap((rule) => rule.findings)
const kept = all.filter((finding) => !finding.refuted)
const unverified = kept.filter((finding) => finding.unverified)
const incomplete = unreviewedRules.length > 0 || unverified.length > 0

if (incomplete) {
  log(`fail forced — unreviewed: ${unreviewedRules.join(', ') || 'none'}, unverified: ${unverified.length}`)
}

const listing = kept
  .map((finding, index) => `${index}. [${finding.severity}] ${label(finding)} — ${finding.issue}`)
  .join('\n')

const grouped =
  kept.length > 1
    ? (await agent(grouping(listing), { label: 'group', phase: 'Group', schema: groups }))?.groups
    : []

const claimed = new Set()
const claim = (group) => {
  const members = group.filter((index) => kept[index] && !claimed.has(index))

  members.forEach((index) => claimed.add(index))
  return members
}

const byRootCause = [...(grouped ?? []), ...kept.map((_, index) => [index])]
  .map(claim)
  .filter((group) => group.length)

return {
  verdict: incomplete || kept.some(blocks) ? 'fail' : 'pass',
  unreviewedRules,
  findings: byRootCause
    .map((group) => group.map((index) => kept[index]).sort(bySeverity))
    .map(([primary, ...rest]) => ({
      ...primary,
      ...(rest.length && { corroboratedBy: rest.map(label) }),
    }))
    .sort(bySeverity)
    .map(({ refuted, reason, ...finding }) => finding),
  dropped: all.filter((finding) => finding.refuted).map(({ refuted, ...finding }) => finding),
}
