// Formatting via the platform's Intl, so dates, numbers, and money read right
// in any locale for free. Formatters are cached because building one is the
// expensive part. Loaded only where used.
//
//   import { money, date, relativeTime } from './lib/format.js'
//   money(1299, 'EUR')          // "€1,299.00"
//   date(Date.now())            // "Jul 4, 2026"
//   relativeTime(-3, 'day')     // "3 days ago"

import { getLocale } from '../common.js'

// Cache a formatter per (kind + locale + options) so we build each once.
let cache = new Map()
let memo = (kind, make) => (locale, options) => {
	let key = `${kind}:${locale}:${JSON.stringify(options)}`
	let f = cache.get(key)
	if (!f) cache.set(key, f = make(locale, options))
	return f
}

let dateFmt   = memo('date',   (l, o) => new Intl.DateTimeFormat(l, o))
let numberFmt = memo('number', (l, o) => new Intl.NumberFormat(l, o))
let relFmt    = memo('rel',    (l, o) => new Intl.RelativeTimeFormat(l, o))
let listFmt   = memo('list',   (l, o) => new Intl.ListFormat(l, o))

export let date = (value, options = { dateStyle: 'medium' }, locale = getLocale()) =>
	dateFmt(locale, options).format(value)

export let time = (value, options = { timeStyle: 'short' }, locale = getLocale()) =>
	dateFmt(locale, options).format(value)

export let number = (value, options, locale = getLocale()) =>
	numberFmt(locale, options).format(value)

export let percent = (value, options, locale = getLocale()) =>
	numberFmt(locale, { style: 'percent', ...options }).format(value)

// `amount` is in major units (1299 → €1,299.00 for EUR uses… no: pass whole
// units). Pass 1299.00 for one thousand two hundred ninety-nine.
export let money = (amount, currency = 'USD', locale = getLocale()) =>
	numberFmt(locale, { style: 'currency', currency }).format(amount)

// A time relative to now: relativeTime(-3, 'day') → "3 days ago".
export let relativeTime = (value, unit, locale = getLocale()) =>
	relFmt(locale, { numeric: 'auto' }).format(value, unit)

// Join with the locale's "and": list(['a','b','c']) → "a, b, and c".
export let list = (items, options, locale = getLocale()) =>
	listFmt(locale, options).format(items)
