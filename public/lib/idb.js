// A small Promise wrapper over IndexedDB, versioned by a list of migrations and
// wired for cross-tab sync. Loaded only by pages that store data.
//
//   let db = openDB('todos', [
//     db => db.createObjectStore('items', { keyPath: 'id' }),   // v1
//     db => db.createObjectStore('items').createIndex('done', 'done'),  // v2
//   ])
//
//   await db.put('items', { id: crypto.randomUUID(), text: 'Buy milk' })
//   let all = await db.getAll('items')
//   db.onChange(store => rerender())   // fires here AND in other tabs
//
// The database version is migrations.length. Each migration runs once, in
// order, when a browser opens a database older than it. Never edit a shipped
// migration — append a new one.

export let openDB = (name, migrations = []) => {
	let version = migrations.length || 1

	let ready = new Promise((resolve, reject) => {
		let req = indexedDB.open(name, version)
		req.onupgradeneeded = e => {
			let db = req.result
			// Apply every migration newer than the version on disk.
			for (let v = e.oldVersion; v < migrations.length; v++)
				migrations[v](db, req.transaction)
		}
		req.onsuccess = () => resolve(req.result)
		req.onerror = () => reject(req.error)
	})

	// Other tabs hear writes here; same-tab listeners are called directly since
	// a BroadcastChannel doesn't deliver to the tab that posted.
	let channel = new BroadcastChannel(`idb:${name}`)
	let listeners = new Set()
	let announce = store => {
		channel.postMessage(store)
		for (let fn of listeners) fn(store)
	}
	channel.onmessage = e => { for (let fn of listeners) fn(e.data) }

	// Run one transaction and resolve with the request's result.
	let run = async (store, mode, fn) => {
		let db = await ready
		return new Promise((resolve, reject) => {
			let tx = db.transaction(store, mode)
			let req = fn(tx.objectStore(store))
			tx.oncomplete = () => resolve(req?.result)
			tx.onerror = () => reject(tx.error)
			tx.onabort = () => reject(tx.error)
		})
	}

	let write = async (store, mode, fn) => {
		let result = await run(store, mode, fn)
		announce(store)
		return result
	}

	return {
		get:    (store, key)   => run(store, 'readonly', s => s.get(key)),
		getAll: (store, query) => run(store, 'readonly', s => s.getAll(query)),
		count:  (store, query) => run(store, 'readonly', s => s.count(query)),

		put:    (store, value, key) => write(store, 'readwrite', s => s.put(value, key)),
		add:    (store, value, key) => write(store, 'readwrite', s => s.add(value, key)),
		delete: (store, key)        => write(store, 'readwrite', s => s.delete(key)),
		clear:  (store)             => write(store, 'readwrite', s => s.clear()),

		// Subscribe to writes (this tab and others). Returns an unsubscribe fn.
		onChange(fn) { listeners.add(fn); return () => listeners.delete(fn) },

		ready,
	}
}
