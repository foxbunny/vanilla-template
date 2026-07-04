// The canonical page. Copy this trio (index.html/.js/.css) to start a new one.
// It shows the whole loop: store in IndexedDB, render with the keyed
// reconciler, update on every change (including from another tab).

import { $, delegate, renderTemplate, renderList, fillParts, showToast } from './common.js'
import { openDB } from './lib/idb.js'

// Register the offline cache. Optional — remove if the page needn't work on a
// plane.
if ('serviceWorker' in navigator)
	navigator.serviceWorker.register('service-worker.js').catch(() => {})

// ── Data ────────────────────────────────────────────────────────────────────
let db = openDB('tasks', [
	db => db.createObjectStore('items', { keyPath: 'id' }),   // v1
])

let rowTemplate = $('@row-template')

// ── What to show ─────────────────────────────────────────────────────────────
// The filter is a URL query param, so it's shareable and survives reload.
let filter = new URLSearchParams(location.search).get('filter') || 'all'
let matches = task =>
	filter === 'active' ? !task.done :
	filter === 'done'   ? task.done  : true

// Mark the active filter link.
for (let a of $('@filters').children)
	a.setAttribute('aria-current', a.search === `?filter=${filter}` ? 'page' : 'false')

// ── Render ────────────────────────────────────────────────────────────────────
// One function, called after every change. Reads the store, filters, and hands
// the list to renderList, which reuses rows and moves only what changed.
let render = async () => {
	let tasks = (await db.getAll('items')).sort((a, b) => b.createdAt - a.createdAt)
	let shown = tasks.filter(matches)

	renderList($('@list'), shown,
		task => {
			let row = renderTemplate(rowTemplate, task)   // new task → build a row
			row.dataset.id = task.id
			paint(row, task)
			return row
		},
		{ update: (row, task) => paint(row, task) },       // existing → refresh
	)

	$('@empty').hidden = shown.length > 0
}

// Put one task's data onto its row. Text goes in via the reconciler-friendly
// fillParts; state that CSS reacts to goes on as data-*.
let paint = (row, task) => {
	fillParts(row, { text: task.text })
	$('@done', row).checked = task.done
	row.toggleAttribute('data-done', task.done)   // CSS strikes through when set
}

// ── Add ───────────────────────────────────────────────────────────────────────
$('@add-form').addEventListener('submit', async e => {
	e.preventDefault()
	let text = $('@new-text').value.trim()
	if (!text) return
	await db.add('items', { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() })
	e.target.reset()
	$('@new-text').focus()
})

// ── Toggle done ────────────────────────────────────────────────────────────────
delegate('change', '@done', async (e, checkbox) => {
	let id = checkbox.closest('.task').dataset.id
	let task = await db.get('items', id)
	await db.put('items', { ...task, done: checkbox.checked })
})

// ── Delete ─────────────────────────────────────────────────────────────────────
delegate('click', '@remove', async (e, btn) => {
	let id = btn.closest('.task').dataset.id
	await db.delete('items', id)
	showToast('Task deleted.', 'info')
})

// ── Edit (dialog) ───────────────────────────────────────────────────────────────
let editing = null
delegate('click', '@edit', (e, btn) => {
	editing = btn.closest('.task').dataset.id
	let text = $('.task-text', btn.closest('.task')).textContent
	$('@edit-text').value = text
	$('@edit-dialog').showModal()
})

$('@edit-form').addEventListener('submit', async e => {
	// Cancel button closes without saving; Save commits.
	if (e.submitter?.value !== 'save' || !editing) return
	let task = await db.get('items', editing)
	await db.put('items', { ...task, text: $('@edit-text').value.trim() })
	editing = null
})

// ── Keep the screen in step ──────────────────────────────────────────────────
// Every write announces itself — here and in other tabs — so one render()
// covers local edits and cross-tab sync alike.
db.onChange(render)
render()
