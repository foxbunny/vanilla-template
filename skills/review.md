# review — check changed files against the house rules

Report where the working changes break this repo's house rules. The deliverable
is a list of violations grouped by file, each citing the rule and the line. The
boundary: it **judges, it does not edit**.

**Top guardrail: report only — never auto-fix. Report, then ask before applying
fixes.** Silent edits hide what was wrong.

## 1. Pick the files — the argument names files/globs; default to the changes

If an argument is given, review those files/globs. Otherwise review the working
changes: modified plus untracked files (`git diff --name-only` and
`git ls-files --others --exclude-standard`). Not a git repo yet? Ask which files.
Only review `.html`, `.css`, and `.js`.

## 2. Load the rules for each file type present

- HTML → `rules/html.md`
- CSS → `rules/css.md`
- JavaScript → `rules/javascript.md`

Plus the cross-cutting checks: namespace crossing (JS selecting a `class`/`id`, or
CSS styling a `[data-part]`); translatable text built in JS; HTML from strings;
`px` or literal colours instead of tokens; a JS timer doing CSS's job.

## 3. Report, grouped by file

Cite the specific rule and the offending line(s). If a file is clean, say so.

## Notes

- **Honesty over optimism** — if you couldn't check something, say so; don't imply
  a clean pass you didn't run.
- The house rules are the *standard*; this command is the *action* over them. The
  standard lives in `rules/` — reference it, never restate it as the source here.
- Argument token differs by agent (`$ARGUMENTS`/`$1`, `{{args}}`, or plain
  language) — see `skills/README.md`.
