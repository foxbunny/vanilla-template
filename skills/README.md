# skills/ — portable command bodies

These are the repo's invokable workflows, written **once, agent-neutrally**. Each
`<name>.md` here is the *body* of a command; the header that makes it fire is
added per agent. The body prose is reusable verbatim — only the header and the
argument token change between tools. (Approach borrowed from the `skillcraft`
library.)

## Two kinds of agent customization

| Primitive | What it is | Where it lives here |
| --- | --- | --- |
| **Standing context** (rules / instructions) | Always-relevant background the agent respects on every request. | `AGENTS.md` (the constants) + `rules/*.md` (detailed house rules). |
| **Invokable command** (skill / workflow) | A task template fired deliberately to *do* a multi-step job. | This folder — one file per command. |

The **action is the skill; the standard it enforces is a rule.** `review` (a
skill) checks a diff against the house rules (standing context in `rules/`) — it
*references* the rule, never restates it. Keep each standard in one place.

## The body skeleton

Every file here follows the same shape, so wrapping it for any agent is
mechanical:

```
# <name> — <short imperative summary>
<intent paragraph>          # the DELIVERABLE and the BOUNDARY ("does X, not Y")
**Top guardrail: …**        # the one invariant most likely to be broken
## 1. <step> — detail       # numbered, ordered, dependencies explicit
## Notes                    # standing constraints, sibling cross-refs, honesty reminders
```

The `description` (in each agent's header) is the most important line: in
model-decided and menu modes it's both the trigger and the label. Lead with the
outcome.

## Wrapping a body for a specific agent

The body stays the same; you add the header the tool expects and swap the
argument token. Where each lands:

| Agent | Command file | Argument token |
| --- | --- | --- |
| **Claude Code** | `.claude/skills/<name>/SKILL.md` (dir; YAML frontmatter: `name`, `description`, `argument-hint`) | `$ARGUMENTS` / `$1` |
| **Cursor** | `.cursor/commands/<name>.md` (plain Markdown, no frontmatter) | inline text |
| **GitHub Copilot** | `.github/prompts/<name>.prompt.md` (frontmatter: `description`, `mode`) | inline text |
| **Gemini CLI** | `.gemini/commands/<name>.toml` (`prompt`, `description`) | `{{args}}` |
| **OpenAI Codex** | `.agents/skills/<name>/SKILL.md` (dir; frontmatter: `name`, `description`) | plain language |

This repo ships the **Claude Code** wrappers in `.claude/skills/`. Each is a thin
header plus "follow `skills/<name>.md`", so the body isn't duplicated. For an
agent that can't read a sibling file at run time, inline the body into its command
file instead of pointing at it.

**Standing context is closer to portable:** `AGENTS.md` is read by Codex, Cursor,
and Copilot; `CLAUDE.md` (which points at `AGENTS.md`) by Claude. Put invariants
in `AGENTS.md` and let each tool's native rule file reference them.

## The commands

| Command | Deliverable |
| --- | --- |
| [new-page](new-page.md) | A new page's `NAME.html/.js/.css` trio, copied from the canonical example and trimmed. |
| [add-icon](add-icon.md) | One `<symbol>` added to `icons.svg` so `<x-icon name="…">` can use it. |
| [design](design.md) | A look-and-feel change made in `common.css` tokens and checked in the gallery. |
| [review](review.md) | Changed files checked against the house rules; violations reported, not fixed. |
| [diary](diary.md) | One dated, append-only entry in `todo/diary.md` for a non-obvious thing learned. |
