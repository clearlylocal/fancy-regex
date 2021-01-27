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
		source += segment.replace(/\s+|#.+/g, '')

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
	if (!args[0] || !args[0].raw) {
		const [flags] = args

		return _regex(flags)
	} else {
		const [template, ...substitutions] = args

		return _regex('')(template, ...substitutions)
	}
}
