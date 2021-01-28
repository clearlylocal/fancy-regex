import { regex, unwrap } from '../src'
import { regexCompare } from './helpers/regexCompare'

describe('unwrap', () => {
	it('unwraps', () => {
		const re = /^.$/
		const expected = /./
		const actual = unwrap(re)

		regexCompare(actual, expected)
	})

	it('unwraps start-only', () => {
		const re = /^./
		const expected = /./
		const actual = unwrap(re)

		regexCompare(actual, expected)
	})

	it('unwraps end-only', () => {
		const re = /.$/
		const expected = /./
		const actual = unwrap(re)

		regexCompare(actual, expected)
	})

	it('is no-op on already-unwrapped', () => {
		const re = /./
		const expected = re
		const actual = unwrap(expected)

		regexCompare(actual, expected)
	})

	it('is idempotent', () => {
		const re = /^.$/
		const expected = /./
		const actual = unwrap(unwrap(unwrap(unwrap(re))))

		regexCompare(actual, expected)
	})

	it('is reversible', () => {
		const re = /^.$/
		const expected = re
		const actual = regex`^${unwrap(re)}$`

		regexCompare(actual, expected)
	})

	it('preserves flags by default', () => {
		const re = /^.$/gimsuy
		const expected = /./gimsuy
		const actual = unwrap(re)

		regexCompare(actual, expected)
	})

	it('can override flags with string', () => {
		const re = /^.$/gim
		const expected = /./suy
		const actual = unwrap(re, 'suy')

		regexCompare(actual, expected)
	})

	it('can override flags with options', () => {
		const re = /^.$/gim
		const expected = /./suy
		const actual = unwrap(re, {
			dotAll: true,
			unicode: true,
			sticky: true,
		})

		regexCompare(actual, expected)
	})

	it('preserves whitespace', () => {
		const re = /^   $/
		const expected = /   /
		const actual = unwrap(re)

		regexCompare(actual, expected)
	})
})
