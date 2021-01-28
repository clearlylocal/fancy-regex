import { proxy as regex } from '../src'
import { regexCompare } from './helpers/regexCompare'

describe('proxy', () => {
	it('creates regex with no flags', () => {
		const expected = /a/
		const actual1 = regex`a`
		const actual2 = regex()`a`
		const actual3 = regex('')`a`
		const actual4 = regex({})`a`

		regexCompare(actual1, expected)
		regexCompare(actual2, expected)
		regexCompare(actual3, expected)
		regexCompare(actual4, expected)
	})

	it('creates regex with flags as arg', () => {
		const expected = /a/g
		const actual = regex('g')`a`

		regexCompare(actual, expected)
	})

	it('creates regex with options as arg', () => {
		const expected = /a/m
		const actual = regex({ multiline: true })`a`

		regexCompare(actual, expected)
	})

	it('creates regex with dot flag notation ', () => {
		const expected = /a/g
		const actual = regex.g`a`

		regexCompare(actual, expected)
	})

	it('creates regex with all flags with dot flag notation', () => {
		const expected = /a/gimsuy
		const actual = regex.gimsuy`a`

		regexCompare(actual, expected)
	})

	it('collapses whitespace as normal', () => {
		const expected = /./g
		const actual1 = regex.g`  .  `
		const actual2 = regex('g')`  .  `

		regexCompare(actual1, expected)
		regexCompare(actual2, expected)
	})

	it('interpolates as normal', () => {
		const expected = / !! /g
		const actual1 = regex.g`${expected}`
		const actual2 = regex('g')`${expected}`

		regexCompare(actual1, expected)
		regexCompare(actual2, expected)
	})
})
