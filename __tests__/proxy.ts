import { proxy as regex } from '../src'
import { regexCompare } from './helpers/regexCompare'

describe('proxy', () => {
	it('creates regex with no flags using ._', () => {
		const expected = /a/
		const actual = regex._`a`

		regexCompare(expected, actual)
	})

	it('creates regex with a flag using .<flag> ', () => {
		const expected = /a/g
		const actual = regex.g`a`

		regexCompare(expected, actual)
	})

	it('creates regex with all flags using .<flags>', () => {
		const expected = /a/gimsuy
		const actual = regex.gimsuy`a`

		regexCompare(expected, actual)
	})

	describe('works the same as base `regex` when not using .<flag>', () => {
		it('no flags', () => {
			const expected = /a/
			const actual1 = regex`a`
			const actual2 = regex()`a`
			const actual3 = regex('')`a`
			const actual4 = regex({})`a`

			regexCompare(expected, actual1)
			regexCompare(expected, actual2)
			regexCompare(expected, actual3)
			regexCompare(expected, actual4)
		})

		it('creates regex with flags as arg', () => {
			const expected = /a/g
			const actual = regex('g')`a`

			regexCompare(expected, actual)
		})

		it('creates regex with options as arg', () => {
			const expected = /a/m
			const actual = regex({ multiline: true })`a`

			regexCompare(expected, actual)
		})

		it('collapses whitespace as normal', () => {
			const expected = /./g
			const actual1 = regex.g`  .  `
			const actual2 = regex('g')`  .  `

			regexCompare(expected, actual1)
			regexCompare(expected, actual2)
		})

		it('interpolates as normal', () => {
			const expected = / !! /g
			const actual1 = regex.g`${expected}`
			const actual2 = regex('g')`${expected}`

			regexCompare(expected, actual1)
			regexCompare(expected, actual2)
		})
	})
})
