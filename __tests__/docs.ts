import regex from '../src'
import { regexCompare } from './helpers/regexCompare'

describe('examples from docs', () => {
	const uuids = [
		'00ac35a2-44ff-4694-84b3-f378d8f0cd0e',
		'edf9e977-1df2-45cc-8144-40572e9632ad',
		'cf214337-2de5-4eea-8075-6d584b06722d',
		'a96e7e75-ef4a-4666-a115-8bddbc237af0',
		'6dd855de-eb80-4d98-8d6f-46d3bc447e9a',
	]

	const myFancyRegex = regex`
		hello,\ world!        # escaped whitespace with backslash
	`

	const myGlobalRegex = regex('g')`🌎`

	const myInterpolatedRegex = regex('i')`
		^
			${'abc'}          # seamlessly interpolate strings...
			${myFancyRegex}   # ...and other regexes
			${myGlobalRegex}  # inner flags are ignored when interpolated

			\w\d\b\0\\        # look Mom, no double escaping!

			...

			\r\n\t\x20        # use "\x20" to match a literal space
		$
	`

	const myRegexWithOptions = regex({
		unicode: true,
		global: true,
	})`
			^
				💩+    # with unicode enabled, this matches by codepoint
			$
		`

	it('myFancyRegex', () => {
		const expected = /hello, world!/

		regexCompare(myFancyRegex, expected)
	})

	it('myInterpolatedRegex', () => {
		const expected = /^abchello, world!🌎\w\d\b\0\\...\r\n\t\x20$/i

		regexCompare(myInterpolatedRegex, expected)
	})

	it('myRegexWithOptions', () => {
		const expected = /^💩+$/gu

		regexCompare(myRegexWithOptions, expected)
	})

	it('regex.exact', () => {
		expect(regex.exact('.[xy]').test('.[xy]')).toBe(true)
		expect(regex.exact('.[xy]').test('ax')).toBe(false)
	})

	it('regex.exact', () => {
		expect(regex.exact('.[xy]').test('.[xy]')).toBe(true)
		expect(regex.exact('.[xy]').test('ax')).toBe(false)
	})

	describe('uuid (regex.unwrap)', () => {
		const singleHex = /^[0-9a-f]$/i

		const hex = regex.unwrap(singleHex)

		const singleUuid = regex`
			^
				${hex}{8}
				-
				${hex}{4}
				-
				${hex}{4}
				-
				${hex}{4}
				-
				${hex}{12}
			$
		`

		const multipleUuid = regex.unwrap(singleUuid, 'g')

		it('hex', () => {
			regexCompare(hex, /[0-9a-f]/i)
		})

		it('singleUuid', () => {
			uuids.forEach(uuid => {
				expect(uuid).toMatch(singleUuid)
			})
		})

		it('multipleUuid', () => {
			expect(uuids.join(' ').match(multipleUuid)).toHaveLength(
				uuids.length,
			)
		})
	})
})
