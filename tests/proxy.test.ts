import { assertEquals } from 'std/assert/mod.ts'
import { regex } from '../src/mod.ts'

Deno.test('proxy', async (t) => {
	await t.step('creates regex with no flags using ._', () => {
		const expected = /a/
		const actual = regex._`a`

		assertEquals(expected, actual)
	})

	await t.step('creates regex with a flag using .<flag> ', () => {
		const expected = /a/g
		const actual = regex.g`a`

		assertEquals(expected, actual)
	})

	await t.step('creates regex with all flags using .<flags>', () => {
		const expected = /a/gimsuy
		const actual = regex.gimsuy`a`

		assertEquals(expected, actual)
	})

	await t.step('works the same as base `regex` when not using .<flag>', async (t) => {
		await t.step('no flags', () => {
			const expected = /a/
			const actual1 = regex()`a`
			const actual2 = regex('')`a`
			const actual3 = regex({})`a`

			assertEquals(expected, actual1)
			assertEquals(expected, actual2)
			assertEquals(expected, actual3)
		})

		await t.step('creates regex with flags as arg', () => {
			const expected = /a/g
			const actual = regex('g')`a`

			assertEquals(expected, actual)
		})

		await t.step('creates regex with options as arg', () => {
			const expected = /a/m
			const actual = regex({ multiline: true })`a`

			assertEquals(expected, actual)
		})

		await t.step('collapses whitespace as normal', () => {
			const expected = /./g
			const actual1 = regex.g`  .  `
			const actual2 = regex('g')`  .  `

			assertEquals(expected, actual1)
			assertEquals(expected, actual2)
		})

		await t.step('interpolates as normal', () => {
			const expected = / !! /g
			const actual1 = regex.g`${expected}`
			const actual2 = regex('g')`${expected}`

			assertEquals(expected, actual1)
			assertEquals(expected, actual2)
		})
	})
})
