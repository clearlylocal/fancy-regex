import { assert, assertEquals } from 'std/assert/mod.ts'
import { exact, regex, regexEscape } from '../src/mod.ts'

const ALL_ASCIIS = [...new Array(0x80).keys()]
	.map((k) => String.fromCodePoint(k))
	.join('')

Deno.test('regexEscape', async (t) => {
	await t.step('regexEscape', async (t) => {
		await t.step('escapes correctly', () => {
			const str = '$()*+-.?[\\]^{|}'

			const re = regex`
				^
					${regexEscape(str)}
				$
			`

			assert(re.test(str) === true)
		})
	})
})

Deno.test('exact', async (t) => {
	await t.step('escapes correctly', () => {
		const str = '$()*+-.?[\\]^{|}'

		const re = regex()`
			^
				${exact(str)}
			$
		`

		assert(re.test(str) === true)
	})

	await t.step('escapes correctly (unicode)', () => {
		const str = '$()*+-.?[\\]^{|}'

		const re = regex('u')`
			^
				${exact(str)}
			$
		`

		assert(re.test(str) === true)
	})

	await t.step('escapes all ASCIIs correctly', () => {
		const re = regex('u')`
			^
				${exact(ALL_ASCIIS)}
			$
		`

		assert(re.test(ALL_ASCIIS) === true)
	})

	await t.step('escapes all ASCIIs correctly (reversed)', () => {
		const reversed = [...ALL_ASCIIS].reverse().join('')

		const re = regex('u')`
			^
				${exact(reversed)}
			$
		`

		assert(re.test(reversed) === true)
	})

	await t.step('escapes inside a capturing group', () => {
		const re = regex('u')`
			(
				${exact(ALL_ASCIIS)}
			)
		`

		assert(re.test(ALL_ASCIIS) === true)
	})

	await t.step('escapes inside a character class', () => {
		const re = regex('u')`
			[
				${exact(ALL_ASCIIS)}
			]
		`
		;[...ALL_ASCIIS].forEach((ch) => {
			assert(re.test(ch) === true)
		})
	})

	await t.step('does not collapse whitespace', () => {
		const expected = /\r\n /

		const actual = exact('\r\n ')

		assertEquals(actual, expected)
	})

	await t.step('dot matches only literal dot', () => {
		const re = exact('.', 'g')
		const dotAll = exact('.', { dotAll: true })

		assert(re.test('a') === false)
		assert(dotAll.test('a') === false)
		assert(ALL_ASCIIS.match(re)?.length === 1)
		assert(ALL_ASCIIS.match(dotAll)?.length === 1)
	})

	await t.step('works with flags', () => {
		const expected = /(?:)/gimsuy

		const actual = exact('', 'gimsuy')

		assertEquals(actual, expected)
	})

	await t.step('works with options', () => {
		const expected = /(?:)/y

		const actual = exact('', { sticky: true })

		assertEquals(actual, expected)
	})

	await t.step('works case insensitive', () => {
		assert(exact('.[xy]', '').test('.[XY]') === false)
		assert(exact('.[xy]', 'i').test('.[XY]') === true)
	})

	await t.step('works global', () => {
		assert('.[XY] .[xy] .[xY]'.match(exact('.[xy]', 'gi'))?.length === 3)
	})

	await t.step('works like String#replaceAll if global flag is set', () => {
		const val = '$()*+-.?[\\]^{|}'
		const input = `one_${val}_two_${val}_three`

		const expected = 'one_!_two_!_three'

		const re = exact(val, 'g')

		assert(input.replace(re, '!') === expected)
	})

	await t.step('interpolated {} in flagless regex', () => {
		const expected = /.{1}/

		const actual = regex._`${/.{1}/}`

		assertEquals(actual, expected)
	})

	await t.step('interpolated {} in `i` regex', () => {
		const expected = /.{1}/i

		const actual = regex.i`${/.{1}/i}`

		assertEquals(actual, expected)
	})

	await t.step('interpolated {} in `u` regex', () => {
		const expected = /.{1}/u

		const actual = regex.u`${/.{1}/u}`

		assertEquals(actual, expected)
	})

	await t.step('interpolated {} in `v` regex', () => {
		const expected = new RegExp(String.raw`.{1}`, 'v')

		const actual = regex.v`${new RegExp(String.raw`.{1}`, 'v')}`

		assertEquals(actual, expected)
	})

	await t.step('interpolated {} in `iu` regex', () => {
		const expected = /.{1}/iu

		const actual = regex.iu`${/.{1}/iu}`

		assertEquals(actual, expected)
	})

	await t.step('interpolated {} in `iv` regex', () => {
		const expected = new RegExp(String.raw`.{1}`, 'iv')

		const actual = regex.iv`${new RegExp(String.raw`.{1}`, 'iv')}`

		assertEquals(actual, expected)
	})

	// // TODO: should this be passing? what should behavior be?
	// await t.step('interpolated flagless {} in `u` regex', () => {
	// 	const expected = /.{1}/u

	// 	const actual = regex.u`${/.{1}/}`

	// 	assertEquals(actual, expected)
	// })
})
