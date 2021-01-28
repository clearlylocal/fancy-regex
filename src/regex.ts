const flagMap = {
	global: 'g',
	ignoreCase: 'i',
	multiline: 'm',
	dotAll: 's',
	sticky: 'y',
	unicode: 'u',
} as const

export type RegexOptions = Partial<Record<keyof typeof flagMap, boolean>>

const _regex = (options: string | RegexOptions = {}) => (
	template: TemplateStringsArray,
	...substitutions: any[]
) => {
	let source = ''

	template.raw.forEach((segment, idx) => {
		source += segment
			/* Remove comments following unescaped # */
			.replace(/(\\+|^|[^\\])#.*/g, (m, before) => {
				/* If odd number of backslashes, one of them is esc char */
				if (before.includes('\\') && before.length % 2) {
					return m.slice(1) /* Consumes esc char */
				}

				return before
			})
			/*
				Replace escaped ` with literal.
				Must be odd number of backslashes
				because otherwise would terminate the template string.
			*/
			.replace(/\\`/g, '`')
			/*
				Escaped ${ is a no-op.
				Use literal $ rather than regex $ (end-of-string)
				because always followed by {,
				thus cannot be end-of-string.
			*/
			// .replace(/\\\${/g, '$&') // no-op
			/* Collapse whitespace */
			.replace(/(\\+|^|[^\\])(\s+)/g, (_m, before, space) => {
				/* If odd number of backslashes, one of them is esc char */
				if (before.includes('\\') && before.length % 2) {
					/* Consumes esc char and escapes a single whitespace char */
					return before.slice(1) + space[0]
				}

				return before
			})

		const sub = substitutions[idx]

		if (sub instanceof RegExp) {
			source += sub.source
		} else {
			source += sub ?? ''
		}
	})

	let flags = ''

	if (typeof options === 'string') {
		flags = options
	} else {
		Object.entries(flagMap).forEach(([k, v]) => {
			if (options[k as keyof RegexOptions]) {
				flags += v
			}
		})
	}

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
			(template as any) as TemplateStringsArray,
			...substitutions,
		)
	} else {
		const [flags] = args

		return _regex(flags)
	}
}
