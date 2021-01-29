import { regex, RegexOptions } from './regex'

export function regexEscape(input: string) {
	const fragment = input.replace(/[$()*+\-.?[\\\]^{|}]/g, m => {
		const digits = m.codePointAt(0)!.toString(16).padStart(2, '0')

		return `\\x${digits}`
	})

	return fragment
}

export function exact(input: string, flags?: string | RegexOptions) {
	return regex(flags)`${regexEscape(input)}`
}
