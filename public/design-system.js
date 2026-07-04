// Wires the interactive demos on the gallery page. Everything it uses comes
// from common.js — this file is only glue, no new component behaviour.

import { $, delegate, showToast, renderVariant, setLocale } from './common.js'

// ── Theme toggle ────────────────────────────────────────────────────────────
// Flip <html data-theme>. common.css does the rest (and animates the change).
$('@theme-toggle').addEventListener('click', () => {
	let root = document.documentElement
	let next = root.dataset.theme === 'dark' ? 'light' : 'dark'
	root.dataset.theme = next
	$('x-icon', $('@theme-toggle')).setAttribute('name', next === 'dark' ? 'sun' : 'moon')
})

// ── Toast buttons ───────────────────────────────────────────────────────────
delegate('click', '[data-toast]', (e, btn) => {
	let level = btn.dataset.toast
	showToast(`This is a ${level} toast.`, level)
})

// ── Dialog ──────────────────────────────────────────────────────────────────
$('@open-dialog').addEventListener('click', () => $('@dialog').showModal())

// ── Form: show it validates, don't actually submit anywhere ─────────────────
$('@demo-form').addEventListener('submit', e => {
	e.preventDefault()
	showToast('Submitted — see the console for the data.', 'success')
	console.log('form data:', Object.fromEntries(new FormData(e.target)))
})

// ── Icon grid ───────────────────────────────────────────────────────────────
// List every symbol in the sprite so the gallery stays in step with icons.svg.
fetch('icons.svg')
	.then(r => r.text())
	.then(svg => {
		let doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
		let grid = $('@icon-grid')
		for (let symbol of doc.querySelectorAll('symbol')) {
			let name = symbol.id.replace(/^icon-/, '')
			let fig = document.createElement('figure')
			let icon = document.createElement('x-icon')
			icon.setAttribute('name', name)
			let cap = document.createElement('figcaption')
			cap.textContent = name
			fig.append(icon, cap)
			grid.append(fig)
		}
	})

// ── Localization demo ───────────────────────────────────────────────────────
// Keep one stable host element and swap its contents each time, so the picked
// variant's text lands in the same place.
let cartHost = $('@cart-out')
let updateCart = () => {
	let l = $('@locale').value
	let count = Number($('@count').value) || 0
	setLocale(l)
	cartHost.lang = l
	cartHost.replaceChildren(renderVariant('cart', { count }))
}
$('@locale').addEventListener('change', updateCart)
$('@count').addEventListener('input', updateCart)
updateCart()
