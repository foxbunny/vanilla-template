import { $, delegate, renderTemplate, renderList, fillParts, mountShell } from '../common.js'

// Wire the shared shell chrome (drawer + theme toggle).
mountShell()

let items = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn']
	.map((label, id) => ({ id, label }))

let rowTpl = $('@row')
let list = $('@list')

let render = () => renderList(list, items,
	item => {
		let li = renderTemplate(rowTpl, item)
		li.dataset.id = item.id
		// A stable per-row name lets View Transitions animate a row from its old
		// place to its new one when the order changes.
		li.style.viewTransitionName = `row-${item.id}`
		return li
	},
	{ update: (li, item) => fillParts(li, item) })

// Animate a reorder if the browser supports View Transitions; otherwise just
// re-render.
let animate = fn => document.startViewTransition ? document.startViewTransition(fn) : fn()

// ── Drag with pointer events ────────────────────────────────────────────────
// Live reorder as you drag over a neighbour. Instant (no transition) — that's
// what feels right while a finger or cursor is moving.
let dragId = null

delegate('pointerdown', '@handle', (e, handle) => {
	let li = handle.closest('li')
	dragId = li.dataset.id
	li.setPointerCapture(e.pointerId)
	li.dataset.dragging = ''
})

list.addEventListener('pointermove', e => {
	if (dragId == null) return
	let over = document.elementFromPoint(e.clientX, e.clientY)?.closest('li[data-id]')
	if (!over || over.dataset.id === dragId) return

	let from = items.findIndex(i => String(i.id) === dragId)
	let to = items.findIndex(i => String(i.id) === over.dataset.id)
	if (from === to) return
	let [moved] = items.splice(from, 1)
	items.splice(to, 0, moved)
	render()
})

let endDrag = () => {
	if (dragId == null) return
	list.querySelector(`li[data-id="${dragId}"]`)?.removeAttribute('data-dragging')
	dragId = null
}
list.addEventListener('pointerup', endDrag)
list.addEventListener('pointercancel', endDrag)

// ── Sort, animated ──────────────────────────────────────────────────────────
$('@sort').addEventListener('click', () => {
	items.sort((a, b) => a.label.localeCompare(b.label))
	animate(render)
})

render()
