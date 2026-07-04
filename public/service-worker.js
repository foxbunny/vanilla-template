// Cache-first offline support. Bump CACHE when you change any listed file — the
// old cache is thrown away and everything re-fetched once. That's the whole
// update story; no build tool stamps hashes for you.

let CACHE = 'app-v1'

// The shell to have on hand for an offline first paint. Add a page's files here
// when you want it to work on a plane.
let SHELL = [
	'.',
	'index.html',
	'index.js',
	'index.css',
	'common.js',
	'common.css',
	'icons.svg',
	'manifest.json',
	'lib/idb.js',
]

self.addEventListener('install', e => {
	e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => {
	// Drop caches from older versions.
	e.waitUntil(
		caches.keys()
			.then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
			.then(() => self.clients.claim()))
})

self.addEventListener('fetch', e => {
	// Only handle same-origin GETs; let everything else hit the network.
	if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return

	e.respondWith(
		caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
			// Stash a copy of anything we fetch, so it's there offline next time.
			let copy = res.clone()
			caches.open(CACHE).then(c => c.put(e.request, copy))
			return res
		}).catch(() => caches.match('index.html'))))   // offline fallback
})
