# diary — record a non-obvious thing learned

Add one dated entry to the top of `todo/diary.md` capturing a sharp edge and its
fix, so nobody re-learns it. The boundary: it **appends history; it never rewrites
past entries.**

**Top guardrail: append-only — add a new entry, never edit an old one.** The trail
is the value.

## When to use

A bug whose cause wasn't obvious and what actually fixed it; a platform quirk you
worked around; a decision that looks wrong until you know why. Not for ordinary
changes, or anything the code and history already make plain.

## 1. Read the top of `todo/diary.md` for the format

Newest first, a dated heading, a few plain sentences.

## 2. Add an entry at the top

Under a `## YYYY-MM-DD — short title` heading, using today's actual date
(absolute, not "today"). State the literal symptom and the literal fix, in plain
words, so the next reader recognises it fast.

## 3. Promote a standing rule

If the lesson is a rule everyone should follow — not a one-time gotcha — also fold
it into the matching `rules/*.md`. The diary is the story; the rule is the
standing instruction.

## Notes

- **Append-only history** — reconcile in new entries; don't rewrite old ones.
- Right-home mapping: a one-time gotcha stays in the diary; a rule everyone must
  follow belongs in `rules/`. Pick the lightest home that lasts.
