import { regex } from './regex'

// Experimental API. Requires Proxy or a polyfill.

type Flags = Exclude<
	'_' | `${'g' | ''}${'i' | ''}${'m' | ''}${'s' | ''}${'u' | ''}${'y' | ''}`,
	''
>

export const proxy = new Proxy(regex, {
	get(target, flags: Flags) {
		return target(flags === '_' ? '' : flags)
	},
	apply(target, _thisArg, args) {
		return target(...args)
	},
}) as typeof regex &
	Record<
		Flags,
		(template: TemplateStringsArray, ...substitutions: any[]) => RegExp
	>
