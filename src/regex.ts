import { getContextAgnosticMap, regexEscape, regexLength } from './escaping'

export class RegexFragment extends String {}

export class LazyAlternation extends Array {
	constructor(...args: [unknown[]] | unknown[]) {
		super(...(Array.isArray(args[0]) ? args[0] : args))
	}
}

const flagMap = {
	global: 'g',
	ignoreCase: 'i',
	multiline: 'm',
	dotAll: 's',
	sticky: 'y',
	unicode: 'u',
} as const

export type RegexOptions = Partial<Record<keyof typeof flagMap, boolean>>

const commentRegex = /(\\*)#(.*)/g

const commentReplacer = (_m: string, slashes: string, after: string) => {
	/* If odd number of backslashes, one of them is esc char */
	if (slashes.length % 2) {
		return (
			slashes.slice(1) /* Consumes esc char */ +
			'#' +
			after.replace(commentRegex, commentReplacer)
		)
	}

	return slashes
}

const processSub = (flags: string) => (sub: unknown) => {
	if (sub instanceof RegExp) {
		if (sub.flags === flags) {
			return sub.source
		} else {
			const mapIn = getContextAgnosticMap(sub.flags)
			const mapOut = getContextAgnosticMap(flags)

			const diff: string[] = []

			for (const ch of Object.keys(mapIn)) {
				// console.log({ mapIn, ch }, mapIn[ch])
				if (mapIn[ch] !== mapOut[ch]) {
					diff.push(mapIn[ch])
				}
			}

			for (const ch of Object.keys(mapOut)) {
				if (mapIn[ch] !== mapOut[ch]) {
					diff.push(ch)
				}
			}

			const re = new RegExp(
				`(?:${diff.map((x) => regexEscape(x, 'i')).join('|')})`,
				'gi',
			)

			return !diff.length
				? sub.source
				: sub.source.replace(
						re,
						(m) => mapOut[m.startsWith('\\') ? m.slice(1) : m] ?? m,
				  )
		}
	} else if (typeof sub === 'string') {
		return regexEscape(sub, flags)
	} else {
		return String(sub ?? '')
	}
}

const _regex =
	(options: string | RegexOptions = {}) =>
	(template: TemplateStringsArray, ...substitutions: unknown[]) => {
		let source = ''
		let flagArr: string[] = []

		if (typeof options === 'string') {
			flagArr = [...options]
		} else {
			Object.entries(flagMap).forEach(([k, v]) => {
				if (options[k as keyof RegexOptions]) {
					flagArr.push(v)
				}
			})
		}

		const flags = flagArr.sort((a, b) => a.localeCompare(b)).join('')

		template.raw.forEach((segment, idx) => {
			source += segment
				/* Remove comments following unescaped # */
				.replace(commentRegex, commentReplacer)
				/*
					Replace escaped ` with literal.
					Must be odd number of backslashes
					because otherwise would terminate the template string.
				*/
				.replace(/\\`/g, '`')
				/*
					Escaped ${ is a no-op.
					We use literal $ rather than regex $ (end-of-string)
					because followed by {, thus cannot be end-of-string.
				*/
				// .replace(/\\\${/g, '$&') // no-op
				/* Collapse whitespace */
				.replace(/(\\*)(\s+)/g, (_m, slashes, space) => {
					/* If odd number of backslashes, one of them is esc char */
					if (space[0] === ' ' && slashes.length % 2) {
						/* Consumes esc char and escapes a single space char */
						/* Escaping Tab, CR, LF not supported */
						/* Use \t, \r, \n instead */
						return slashes.slice(1) + space[0]
					}

					return slashes
				})

			const sub = substitutions[idx]

			if (Array.isArray(sub)) {
				const mult = sub instanceof LazyAlternation ? -1 : 1

				source += `(?:${sub
					.map(processSub(flags))
					.sort((a, b) => mult * (regexLength(b) - regexLength(a)))
					.join('|')})`
			} else {
				source += processSub(flags)(sub)
			}
		})

		return new RegExp(source, flags)
	}

export function regex(
	flags?: string | RegexOptions,
): (template: TemplateStringsArray, ...substitutions: any[]) => RegExp
export function regex(
	template: TemplateStringsArray,
	...substitutions: any[]
): RegExp
export function regex(...args: any[]) {
	if (Array.isArray(args[0])) {
		const [template, ...substitutions] = args

		return _regex('')(
			template as any as TemplateStringsArray,
			...substitutions,
		)
	} else {
		const [flags] = args

		return _regex(flags)
	}
}
