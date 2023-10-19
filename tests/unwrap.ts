import { assert } from 'std/assert/assert.ts'
import { regex, unwrap } from '../src/mod.ts'
import { regexCompare } from './helpers/regexCompare.ts'

Deno.test('unwrap', async (t) => {
	await t.step('unwraps', () => {
		const re = /^.$/
		const expected = /./
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})

	await t.step('unwraps start-only', () => {
		const re = /^./
		const expected = /./
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})

	await t.step('unwraps end-only', () => {
		const re = /.$/
		const expected = /./
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})

	await t.step('is no-op on already-unwrapped', () => {
		const re = /./
		const expected = re
		const actual = unwrap(expected)

		regexCompare(expected, actual)
	})

	await t.step('is idempotent', () => {
		const re = /^.$/
		const expected = /./
		const actual = unwrap(unwrap(unwrap(unwrap(re))))

		regexCompare(expected, actual)
	})

	await t.step('is reversible', () => {
		const re = /^.$/
		const expected = re
		const actual = regex`^${unwrap(re)}$`

		regexCompare(expected, actual)
	})

	await t.step('preserves flags by default', () => {
		const re = /^.$/gimsuy
		const expected = /./gimsuy
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})

	await t.step('can override flags with string', () => {
		const re = /^.$/gim
		const expected = /./suy
		const actual = unwrap(re, 'suy')

		regexCompare(expected, actual)
	})

	await t.step('can override flags with options', () => {
		const re = /^.$/gim
		const expected = /./suy
		const actual = unwrap(re, {
			dotAll: true,
			unicode: true,
			sticky: true,
		})

		regexCompare(expected, actual)
	})

	await t.step('preserves whitespace', () => {
		const re = /^   $/
		const expected = /   /
		const actual = unwrap(re)

		regexCompare(expected, actual)
	})
})
