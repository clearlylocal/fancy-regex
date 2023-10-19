import { type Flags, RegexFragment, type RegexOptions } from './regex.ts'
import { _regex } from './regex.ts'

export function unwrap(re: RegExp, flags?: Flags | '' | RegexOptions) {
	const fragment = re.source.replace(/^\^?([\s\S]*?)\$?$/, '$1')

	return _regex(flags ?? re.flags as Flags)`${new RegexFragment(fragment)}`
}
