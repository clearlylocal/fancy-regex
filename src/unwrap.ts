import { regex, RegexOptions, RegexFragment } from './regex'

export function unwrap(re: RegExp, flags?: string | RegexOptions) {
	const fragment = re.source.replace(/^\^?([\s\S]*?)\$?$/, '$1')

	return regex(flags ?? re.flags)`${new RegexFragment(fragment)}`
}
