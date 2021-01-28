import { regex, RegexOptions } from './regex'

export function unwrap(re: RegExp, flags?: string | RegexOptions) {
	const fragment = re.source.replace(/^\^?([\s\S]*?)\$?$/, '$1')

	return regex(flags ?? re.flags)`${fragment}`
}
