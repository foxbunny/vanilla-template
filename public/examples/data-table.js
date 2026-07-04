import { $, $$, delegate, renderTemplate, renderList, fillParts } from '../common.js'

// Some rows to show. In a real page this comes from idb or the network.
let people = [
	['Ada Lovelace', 'Engineer', 36], ['Alan Turing', 'Engineer', 41],
	['Grace Hopper', 'Manager', 45], ['Katherine Johnson', 'Engineer', 52],
	['Edsger Dijkstra', 'Engineer', 38], ['Barbara Liskov', 'Manager', 47],
	['Donald Knuth', 'Engineer', 43], ['Margaret Hamilton', 'Manager', 33],
	['Linus Torvalds', 'Engineer', 29], ['Radia Perlman', 'Designer', 40],
	['Tim Berners-Lee', 'Designer', 39], ['Vint Cerf', 'Manager', 55],
].map(([name, role, age], id) => ({ id, name, role, age }))

let PAGE = 5
let sort = { key: 'name', dir: 'asc' }
let page = 0

let rowTpl = $('@row')

let view = () => {
	let sorted = [...people].sort((a, b) => {
		let x = a[sort.key], y = b[sort.key]
		let cmp = typeof x === 'number' ? x - y : String(x).localeCompare(y)
		return sort.dir === 'asc' ? cmp : -cmp
	})
	let pages = Math.ceil(sorted.length / PAGE)
	page = Math.max(0, Math.min(page, pages - 1))
	return { rows: sorted.slice(page * PAGE, page * PAGE + PAGE), pages, total: sorted.length }
}

let render = () => {
	let { rows, pages, total } = view()

	renderList($('@rows'), rows,
		p => renderTemplate(rowTpl, p),
		{ update: (node, p) => fillParts(node, p) })

	// Reflect sort state on the headers (CSS draws the arrow).
	for (let th of $$('th', $('@head')))
		th.dataset.sort = th.dataset.key === sort.key ? sort.dir : ''

	$('@status').textContent = `${total} people · page ${page + 1} of ${pages}`
	$('@prev').disabled = page === 0
	$('@next').disabled = page >= pages - 1
}

// Click a header to sort; clicking the active column flips direction.
delegate('click', 'th button', (e, btn) => {
	let key = btn.closest('th').dataset.key
	sort = key === sort.key
		? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' }
		: { key, dir: 'asc' }
	render()
})

$('@prev').addEventListener('click', () => { page--; render() })
$('@next').addEventListener('click', () => { page++; render() })

render()
