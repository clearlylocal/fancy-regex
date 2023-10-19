import { _regex, type Flags } from './regex.ts'

// Experimental API. Requires Proxy or a polyfill.

export const regex = new Proxy(_regex, {
	get(target, flags: Flags) {
		return target(flags === '_' ? '' : flags)
	},
	apply(target, _thisArg, args) {
		return target(...args)
	},
}) as
	& typeof _regex
	& Record<
		Flags,
		(template: TemplateStringsArray, ...substitutions: unknown[]) => RegExp
	>

/** @deprecated Alias for `regex`. Use the export named `regex` instead */
export const proxy = regex
