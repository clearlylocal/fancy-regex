import { regex, exact, regexEscape } from '../src'
import { regexCompare } from './helpers/regexCompare'

const ALL_ASCIIS = [...new Array(0x80).keys()]
	.map((k) => String.fromCodePoint(k))
	.join('')

describe('regexEscape', () => {
	describe('regexEscape', () => {
		it('escapes correctly', () => {
			const str = '$()*+-.?[\\]^{|}'

			const re = regex`
				^
					${regexEscape(str)}
				$
			`

			expect(re.test(str)).toBe(true)
		})
	})
})

describe('exact', () => {
	it('escapes correctly', () => {
		const str = '$()*+-.?[\\]^{|}'

		const re = regex`
			^
				${exact(str)}
			$
		`

		expect(re.test(str)).toBe(true)
	})

	it('escapes correctly (unicode)', () => {
		const str = '$()*+-.?[\\]^{|}'

		const re = regex('u')`
			^
				${exact(str)}
			$
		`

		expect(re.test(str)).toBe(true)
	})

	it('escapes all ASCIIs correctly', () => {
		const re = regex('u')`
			^
				${exact(ALL_ASCIIS)}
			$
		`

		expect(re.test(ALL_ASCIIS)).toBe(true)
	})

	it('escapes all ASCIIs correctly (reversed)', () => {
		const reversed = [...ALL_ASCIIS].reverse().join('')

		const re = regex('u')`
			^
				${exact(reversed)}
			$
		`

		expect(re.test(reversed)).toBe(true)
	})

	it('escapes inside a capturing group', () => {
		const re = regex('u')`
			(
				${exact(ALL_ASCIIS)}
			)
		`

		expect(re.test(ALL_ASCIIS)).toBe(true)
	})

	it('escapes inside a character class', () => {
		const re = regex('u')`
			[
				${exact(ALL_ASCIIS)}
			]
		`

		;[...ALL_ASCIIS].forEach((ch) => {
			expect(re.test(ch)).toBe(true)
		})
	})

	it('does not collapse whitespace', () => {
		const expected = /\r\n /

		const actual = exact('\r\n ')

		regexCompare(expected, actual)
	})

	it('dot matches only literal dot', () => {
		const re = exact('.', 'g')
		const dotAll = exact('.', { dotAll: true })

		expect(re.test('a')).toBe(false)
		expect(dotAll.test('a')).toBe(false)
		expect(ALL_ASCIIS.match(re)).toHaveLength(1)
		expect(ALL_ASCIIS.match(dotAll)).toHaveLength(1)
	})

	it('works with flags', () => {
		const expected = /(?:)/gimsuy

		const actual = exact('', 'gimsuy')

		regexCompare(expected, actual)
	})

	it('works with options', () => {
		const expected = /(?:)/y

		const actual = exact('', { sticky: true })

		regexCompare(expected, actual)
	})

	it('works case insensitive', () => {
		expect(exact('.[xy]', '').test('.[XY]')).toBe(false)
		expect(exact('.[xy]', 'i').test('.[XY]')).toBe(true)
	})

	it('works global', () => {
		expect('.[XY] .[xy] .[xY]'.match(exact('.[xy]', 'gi'))).toHaveLength(3)
	})

	it('works like String#replaceAll if global flag is set', () => {
		const val = '$()*+-.?[\\]^{|}'
		const input = `one_${val}_two_${val}_three`

		const expected = 'one_!_two_!_three'

		const re = exact(val, 'g')

		expect(input.replace(re, '!')).toBe(expected)
	})
})
