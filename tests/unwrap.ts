// deno-lint-ignore-file no-regex-spaces
import { assertEquals } from 'std/assert/mod.ts'
import { regex, unwrap } from '../src/mod.ts'

Deno.test('unwrap', async (t) => {
	await t.step('unwraps', () => {
		const re = /^.$/
		const expected = /./
		const actual = unwrap(re)

		assertEquals(actual, expected)
	})

	await t.step('unwraps start-only', () => {
		const re = /^./
		const expected = /./
		const actual = unwrap(re)

		assertEquals(actual, expected)
	})

	await t.step('unwraps end-only', () => {
		const re = /.$/
		const expected = /./
		const actual = unwrap(re)

		assertEquals(actual, expected)
	})

	await t.step('is no-op on already-unwrapped', () => {
		const re = /./
		const expected = re
		const actual = unwrap(expected)

		assertEquals(actual, expected)
	})

	await t.step('is idempotent', () => {
		const re = /^.$/
		const expected = /./
		const actual = unwrap(unwrap(unwrap(unwrap(re))))

		assertEquals(actual, expected)
	})

	await t.step('is reversible', () => {
		const re = /^.$/
		const expected = re
		const actual = regex`^${unwrap(re)}$`

		assertEquals(actual, expected)
	})

	await t.step('preserves flags by default', () => {
		const re = /^.$/gimsuy
		const expected = /./gimsuy
		const actual = unwrap(re)

		assertEquals(actual, expected)
	})

	await t.step('can override flags with string', () => {
		const re = /^.$/gim
		const expected = /./suy
		const actual = unwrap(re, 'suy')

		assertEquals(actual, expected)
	})

	await t.step('can override flags with options', () => {
		const re = /^.$/gim
		const expected = /./suy
		const actual = unwrap(re, {
			dotAll: true,
			unicode: true,
			sticky: true,
		})

		assertEquals(actual, expected)
	})

	await t.step('preserves whitespace', () => {
		const re = /^   $/
		const expected = /   /
		const actual = unwrap(re)

		assertEquals(actual, expected)
	})
})
