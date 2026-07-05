import { $, setLocale, getLocale, renderVariant, loadFragments, mountShell } from '../common.js'

// Wire the shared shell chrome (drawer + theme toggle).
mountShell()

let nameOf = () => $('@name').value || 'friend'

let showGreeting = () => {
	let host = $('@greeting')
	host.lang = getLocale()
	host.replaceChildren(renderVariant('greeting', { name: nameOf() }))
}

let showInbox = () => {
	let host = $('@inbox')
	host.lang = getLocale()
	host.replaceChildren(renderVariant('inbox', { count: Number($('@count').value) || 0 }))
}

let refresh = () => { showGreeting(); showInbox() }

// Switching language loads that language's fragment file if it isn't in yet,
// then re-renders. loadFragments memoizes, so a language loads at most once.
$('@locale').addEventListener('change', async e => {
	setLocale(e.target.value)
	await loadFragments('greeting', e.target.value)
	refresh()
})

$('@new').addEventListener('click', showGreeting)
$('@name').addEventListener('input', showGreeting)
$('@count').addEventListener('input', showInbox)

// First paint: load the starting language's fragments, then render.
loadFragments('greeting', getLocale()).then(refresh)
