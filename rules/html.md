# HTML rules

## Structure

- **Text lives here, not in JS.** Any string a translator could translate is in
  HTML. JS injects values (a name, a count), never sentences. For strings that
  vary by language or plural, use a `<template data-name="…" lang="…">` and
  `renderVariant` — see `rules/javascript.md`.
- **Semantic elements first.** `<button>` for actions, `<a>` for navigation,
  `<dialog>` for modals, `<details>`/`<summary>` for disclosure, `<form>` for
  input, `<nav>`/`<main>`/`<header>`/`<footer>` for landmarks. Reach for a `<div>`
  only when nothing else fits.
- **Let the platform do the work.** `<form>` gives you Enter-to-submit, `required`
  and `type=email` give you validation, `<dialog>.showModal()` gives you a focus
  trap and Esc-to-close, `popover` gives you light-dismiss. Don't re-implement
  these in JS.

## The three namespaces

- `data-part="name"` is the **only** hook JS uses to find an element. Never style
  a `data-part`.
- `id` and `class` are for CSS. Never select them from JS.
- `data-*` (other than `data-part`) is **state** — JS sets it, CSS reacts to it.

## Forms

- Wrap the control in its `<label>` so you don't need `for`/`id` pairs:
  `<label><span>Email</span><input name="email" type="email" required></label>`.
- Use the right `type`, `required`, `min`/`max`, `pattern`. Style validity with
  `:user-invalid` (only fires after the user interacts) — never a JS `keyup`
  validator.
- Give every input a `name`; read the form with `new FormData(form)`.

## Accessibility

- Native elements carry their roles for free — prefer them.
- A control with no visible text needs a name: `aria-label`, or a
  `.visually-hidden` `<span>` inside it.
- Only add ARIA where the platform can't: a custom widget with no native
  equivalent. Don't paint ARIA roles onto elements that already have them.
- Every `<img>` gets `alt` (empty `alt=""` if purely decorative).

## Head

- `<meta charset="utf-8">` and `<meta name="viewport" content="width=device-width,
  initial-scale=1">` on every page.
- Load JS as `<script type="module" src="…">` (deferred by default; no blocking).
- One `<title>` and a `<meta name="description">` per page.
