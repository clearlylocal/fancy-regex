import regex from '../src'

const oldSchool = /abc/
const withFlags = /def/gm
const myFancyRegex = regex`\x42{5}`

const myCaseInsensitiveRegex = regex('i')`
	^
		${oldSchool}    # seamlessly interpolate other regexes
		${myFancyRegex} # also works if the other regex is fancy
		${withFlags}    # flags ignored when interpolated

		\w\d\b\0\\      # look Mom, no double escaping!

		...

		\r\n\t\x20      # use "\x20" to match a literal space
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

describe('examples from docs', () => {
	it('myCaseInsensitiveRegex', () => {
		const expected = /^abc\x42{5}def\w\d\b\0\\...\r\n\t\x20$/i

		expect(myCaseInsensitiveRegex.source).toEqual(expected.source)
		expect(myCaseInsensitiveRegex.flags).toEqual(expected.flags)
	})

	it('myRegexWithOptions', () => {
		const expected = /^💩+$/gu

		expect(myRegexWithOptions.source).toEqual(expected.source)
		expect(myRegexWithOptions.flags).toEqual(expected.flags)
	})
})
