import { regex, RegexFragment, RegexOptions } from './regex'

const asciis = Array.from({ length: 0x80 }, (_, i) => String.fromCodePoint(i))

const getChars = (flags: string) => {
	// delete 'i' as it doesn't affect escaping and messes up matching logic
	const flagSet = new Set(flags)
	flagSet.delete('i')

	flags = [...flagSet].join('')

	return asciis
		.map((ch) => {
			const escaped = `\\x${ch
				.codePointAt(0)!
				.toString(16)
				.padStart(2, '0')}`

			let inClass = escaped
			let outsideClass = escaped
			let agnostic = escaped

			try {
				const inClassRe = new RegExp(`[${ch}]`, flags)

				new RegExp(`[${ch}${ch}]`, flags)
				new RegExp(`[${ch}${ch}\0]`, flags)

				if (
					inClassRe.test(ch) &&
					!asciis
						.filter((x) => x !== ch)
						.some((x) => inClassRe.test(x))
				) {
					inClass = ch
				} else {
					new RegExp(`[\\${ch}]`, flags)

					inClass = `\\${ch}`
				}
			} catch {
				try {
					new RegExp(`[\\${ch}]`, flags)

					inClass = `\\${ch}`
				} catch {}
			}

			try {
				const outsideClassRe = new RegExp(`^${ch}$`, flags)

				if (
					outsideClassRe.test(ch) &&
					!asciis
						.filter((x) => x !== ch)
						.some((x) => outsideClassRe.test(x))
				) {
					outsideClass = ch
				} else {
					new RegExp(`\\${ch}`, flags)

					outsideClass = `\\${ch}`
				}
			} catch {
				try {
					new RegExp(`\\${ch}`, flags)

					outsideClass = `\\${ch}`
				} catch {}
			}

			if (inClass !== outsideClass) {
				try {
					new RegExp(`\\${ch}`, flags)
					new RegExp(`\\${ch}`, flags)

					agnostic = `\\${ch}`
				} catch {}
			} else {
				agnostic = [inClass, outsideClass].sort(
					(a, b) => b.length - a.length,
				)[0]
			}

			return { ch, agnostic, inClass, outsideClass }
		})
		.filter((x) => x.inClass !== x.ch || x.outsideClass !== x.ch)
}

const cache = new Map<string, Record<string, string>>()

export const getContextAgnosticMap = (flags: string) => {
	const cached = cache.get(flags)

	if (cached) {
		return cached
	}

	const obj = Object.fromEntries(
		getChars(flags).map((x) => [x.ch, x.agnostic]),
	)

	cache.set(flags, obj)

	return obj
}

export function regexEscape(input: string, flags = 'u') {
	const contextAgnosticMap = getContextAgnosticMap(flags)
	const chars = Object.values(contextAgnosticMap)

	const replacer = (str: string) =>
		str.replace(
			new RegExp(
				`[${chars.join('')}]`,
				[...new Set([...flags, ...'g'])].join(''),
			),
			(m) => contextAgnosticMap[m],
		)

	return new RegexFragment(replacer(input))
}

export function exact(input: string, flags?: string | RegexOptions) {
	return regex(flags)`${input}`
}

/**
 * Gives approximate logical "length" of a string, regex, or regex fragment, for
 * use in sorting arrays to be used in alternation groups. Doesn't cover various
 * edge cases or variable-length regexes (e.g. /a+/, /b{1,5}/, etc).
 */
export function regexLength(input: RegexFragment | string) {
	return (
		// TODO?
		// .replace(/\[[^\]]+\]/g, '.')
		input
			// TODO?
			// .replace(/(?<=[^\\](\\{2})*)\\b|[^$]/g, '')
			.replace(
				/\\(?:\w\{[^}]+\}|u[0-9a-f]{4}|x[0-9a-f]{2}|[0-8]{3}|c[A-Z]|.)/gi,
				'.',
			).length
	)
}

// TODO?
// export function regexUnescape(input: RegexFragment | string) {
// 	return input.replace(/s/g)
// }
