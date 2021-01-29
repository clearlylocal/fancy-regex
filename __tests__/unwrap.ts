import { regex, unwrap } from '../src'
import { regexCompare } from './helpers/regexCompare'

describe('unwrap', () => {
	it('unwraps', () => {
		const re = /^.$/
		const expected = /./
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})

	it('unwraps start-only', () => {
		const re = /^./
		const expected = /./
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})

	it('unwraps end-only', () => {
		const re = /.$/
		const expected = /./
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})

	it('is no-op on already-unwrapped', () => {
		const re = /./
		const expected = re
		const actual = unwrap(expected)

		regexCompare(expected, actual)
	})

	it('is idempotent', () => {
		const re = /^.$/
		const expected = /./
		const actual = unwrap(unwrap(unwrap(unwrap(re))))

		regexCompare(expected, actual)
	})

	it('is reversible', () => {
		const re = /^.$/
		const expected = re
		const actual = regex`^${unwrap(re)}$`

		regexCompare(expected, actual)
	})

	it('preserves flags by default', () => {
		const re = /^.$/gimsuy
		const expected = /./gimsuy
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})

	it('can override flags with string', () => {
		const re = /^.$/gim
		const expected = /./suy
		const actual = unwrap(re, 'suy')

		regexCompare(expected, actual)
	})

	it('can override flags with options', () => {
		const re = /^.$/gim
		const expected = /./suy
		const actual = unwrap(re, {
			dotAll: true,
			unicode: true,
			sticky: true,
		})

		regexCompare(expected, actual)
	})

	it('preserves whitespace', () => {
		const re = /^   $/
		const expected = /   /
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})
})
