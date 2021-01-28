const flagMap = {
	global: 'g',
	ignoreCase: 'i',
	multiline: 'm',
	sticky: 'y',
	dotAll: 's',
	unicode: 'u',
} as const

export type RegExOptions = Partial<Record<keyof typeof flagMap, boolean>>

const _regex = (options: string | RegExOptions = {}) => (
	template: TemplateStringsArray,
	...substitutions: any[]
) => {
	let source = ''

	template.raw.forEach((segment, idx) => {
		source += segment
			// remove comments following unescaped #
			.replace(/(\\+|^|[^\\])#.*/g, (m, before) => {
				// if odd number of backslashes, one of them is esc char
				if (before.includes('\\') && before.length % 2) {
					return m.slice(1) // consumes esc char
				}

				return before
			})
			// replace escaped ` and ${ with literal
			.replace(/\\(`|\${)/g, (_m, content) => {
				// must be odd number of backslashes
				// because otherwise would terminate the segment
				return content
			})
			// collapse whitespace
			.replace(/(\\+|^|[^\\])(\s+)/g, (_m, before, space) => {
				// if odd number of backslashes, one of them is esc char
				if (before.includes('\\') && before.length % 2) {
					// consumes esc char
					// and escapes a single whitespace char
					return before.slice(1) + space[0]
				}

				return before
			})

		const sub = substitutions[idx]

		if (sub instanceof RegExp) {
			source += sub.source
		} else {
			source += sub || ''
		}
	})

	let flags = ''

	if (typeof options === 'string') {
		flags = options
	} else {
		Object.entries(options).forEach(([k, v]) => {
			if (v) {
				flags += flagMap[k as keyof RegExOptions]
			}
		})
	}

	return new RegExp(source, flags)
}

export default function regex(
	options?: string | RegExOptions,
): (template: TemplateStringsArray, ...substitutions: any[]) => RegExp
export default function regex(
	template: TemplateStringsArray,
	...substitutions: any[]
): RegExp
export default function regex(...args: any[]) {
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
