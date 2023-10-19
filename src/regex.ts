import { getContextAgnosticMap, regexEscape, regexLength } from './escaping.ts'

export class RegexFragment extends String {}

export class LazyAlternation extends Array {
	constructor(...args: [unknown[]] | unknown[]) {
		super(...(Array.isArray(args[0]) ? args[0] : args))
	}
}

const flagMap = {
	hasIndices: 'd',
	global: 'g',
	ignoreCase: 'i',
	multiline: 'm',
	dotAll: 's',
	unicode: 'u',
	unicodeSets: 'v',
	sticky: 'y',
} as const

type _GenericRegexOptions = Partial<Record<keyof typeof flagMap, boolean>>

type VRegexOptions = Omit<_GenericRegexOptions, 'unicode'>
type URegexOptions = Omit<_GenericRegexOptions, 'unicodeSets'>

export type RegexOptions = VRegexOptions | URegexOptions

export type Flags = Exclude<
	'_' | `${'d' | ''}${'g' | ''}${'i' | ''}${'m' | ''}${'s' | ''}${'v' | 'u' | ''}${'y' | ''}`,
	''
>

const commentRegex = /(\\*)#(.*)/g

const isContentful = (x: unknown) => x !== false && x != null

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

			return !diff.length ? sub.source : sub.source.replace(
				re,
				(m) => mapOut[m.startsWith('\\') ? m.slice(1) : m] ?? m,
			)
		}
	} else if (typeof sub === 'string') {
		return regexEscape(sub, flags)
	} else {
		return String(isContentful(sub) ? sub : '')
	}
}

const __regex =
	(options: string | RegexOptions = {}) => (template: TemplateStringsArray, ...substitutions: unknown[]) => {
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

				source += `(?:${
					[
						...new Set([
							...sub
								.filter(isContentful)
								.map((x) => String(processSub(flags)(x))),
						]),
					]
						.sort((a, b) => mult * (regexLength(b) - regexLength(a)))
						.join('|')
				})`
			} else {
				source += processSub(flags)(sub)
			}
		})

		return new RegExp(source, flags)
	}

export function _regex(
	flags?: Flags | '' | RegexOptions,
): (template: TemplateStringsArray, ...substitutions: unknown[]) => RegExp
/** @deprecated For a regex with no flags, use `` regex()`...` `` instead */
export function _regex(
	template: TemplateStringsArray,
	...substitutions: unknown[]
): RegExp
export function _regex(...args: unknown[]) {
	if (Array.isArray(args[0])) {
		const [template, ...substitutions] = args

		return __regex('')(
			template as unknown as TemplateStringsArray,
			...substitutions,
		)
	} else {
		const [flags] = args

		return __regex(flags as Flags | '' | RegexOptions)
	}
}

/** @deprecated Use the proxied version exported from `proxy.ts` instead */
export const regex = _regex
