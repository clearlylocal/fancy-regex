import regex, { RegexOptions } from '.'

export function exact(input: string, flags?: string | RegexOptions) {
	const fragment = input.replace(/[$()*+\-.?[\\\]^{|}]/g, m => {
		const digits = m.codePointAt(0)!.toString(16).padStart(2, '0')

		return `\\x${digits}`
	})

	return regex(flags)`${fragment}`
}
