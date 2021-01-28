import regex from '../src'
import { regexCompare } from './helpers/regexCompare'

describe('sanity checks', () => {
	it('error on invalid regex source', () => {
		expect(() => regex`[`).toThrow(SyntaxError)
	})

	it('error on invalid regex source (unicode)', () => {
		expect(() => regex('u')`\p`).toThrow(SyntaxError)
	})

	it('no error on valid regex source', () => {
		expect(() => regex``).not.toThrow()
	})

	it('no error on unnecessary escape (without unicode flag)', () => {
		expect(() => regex`\p`).not.toThrow()
	})

	it('instanceof RegExp (called directly on template literal)', () => {
		expect(regex``).toBeInstanceOf(RegExp)
	})

	it('instanceof Function when not called (flags)', () => {
		expect(regex('')).toBeInstanceOf(Function)
	})

	it('instanceof Function when not called (options)', () => {
		expect(regex({})).toBeInstanceOf(Function)
	})

	it('instanceof RegExp when called (flags)', () => {
		expect(regex('')``).toBeInstanceOf(RegExp)
	})

	it('instanceof RegExp when called (options)', () => {
		expect(regex({})``).toBeInstanceOf(RegExp)
	})

	it('instanceof Function when not called (no args)', () => {
		expect(regex()).toBeInstanceOf(Function)
	})

	it('instanceof RegExp when called (no args)', () => {
		expect(regex()``).toBeInstanceOf(RegExp)
	})
})

describe('no flags', () => {
	it('empty regex', () => {
		const expected = /(?:)/

		const actual = regex``

		regexCompare(actual, expected)
	})

	it('empty regex with non-capturing group', () => {
		const expected = /(?:)/

		const actual = regex`(?:)`

		regexCompare(actual, expected)
	})

	it('simple', () => {
		const expected = /.+/

		const actual = regex`.+`

		regexCompare(actual, expected)
	})

	it('complex', () => {
		const expected = /\0\b\t\r\n\\/

		const actual = regex`
			\0\b\t\r\n\\ # comment
		`

		regexCompare(actual, expected)
	})
})

describe('string flags', () => {
	it('no flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('gimsuy')``

		regexCompare(actual, expected)
	})

	it('all flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('gimsuy')``

		regexCompare(actual, expected)
	})

	it('stable ordering of flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('yusmig')``

		regexCompare(actual, expected)
	})

	it('stable ordering of flags #2', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('gimsuy')``

		regexCompare(actual, expected)
	})

	it('reject invalid flags', () => {
		expect(() => regex('_')``).toThrow(SyntaxError)
	})

	it('reject duplicate flags', () => {
		expect(() => regex('gg')``).toThrow(SyntaxError)
	})
})

describe('options object', () => {
	it('no flags', () => {
		const expected = /(?:)/

		const actual = regex({})``

		regexCompare(actual, expected)
	})

	it('all flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex({
			global: true,
			ignoreCase: true,
			multiline: true,
			sticky: true,
			dotAll: true,
			unicode: true,
		})``

		regexCompare(actual, expected)
	})
})

describe('whitespace collapsing', () => {
	it('collapse to empty regex', () => {
		const expected = /(?:)/

		const actual = regex`


		`

		regexCompare(actual, expected)
	})

	it('collapse to content-only', () => {
		const expected = /hello_world/

		const actual = regex`hello

		_
		world

		`

		regexCompare(actual, expected)
	})

	it('cannot use literal space', () => {
		expect(regex`^ $`.test(' ')).toBe(false)
	})

	it('can use \\x20 to match space', () => {
		expect(regex`^\x20$`.test(' ')).toBe(true)
	})
})

describe('comment removal', () => {
	it('removes comments at start', () => {
		const expected = /text/

		const actual = regex`# comment
		text
		#comment`

		regexCompare(actual, expected)
	})

	it('removes comments at start of line', () => {
		const expected = /text/

		const actual = regex`text
		# comment`

		regexCompare(actual, expected)
	})

	it('removes comments from hash symbol to EoL', () => {
		const expected = /abc/

		const actual = regex`
			a # A
			b # B
			c # C ########## ...
		`
		regexCompare(actual, expected)
	})

	it('can use \\# to escape hash symbol', () => {
		const expected = /a#Ab#Bc#C/

		const actual = regex`
			a \# A
			b \# B
			c \# C
		`

		regexCompare(actual, expected)
	})

	it('cannot use \\\\# to escape hash symbol', () => {
		const expected = /ab\\c\\#Cd\\\\/

		const actual = regex`
			a # A
			b \\# B
			c \\\# C
			d \\\\# D
		`

		regexCompare(actual, expected)
	})
})

describe('interpolation', () => {
	it('interpolates numbers', () => {
		const expected = /.{5}/

		const actual = regex`.{${2 + 3}}`

		regexCompare(actual, expected)
	})

	it('interpolates strings', () => {
		const str = 'hello_world'

		const expected = /.hello_world/

		const actual = regex`.${str}`

		regexCompare(actual, expected)
	})

	it('preserves whitespace in interpolated string', () => {
		const crlf = '\r\n'
		const tab = '	'
		const space = ' '

		const expected = /\r\n	 /

		const actual = regex`${crlf}${tab}${space}`

		regexCompare(actual, expected)
	})

	it('interpolates other regexes', () => {
		const re = /a b c/

		const expected = /.a b c/

		const actual = regex`.${re}`

		regexCompare(actual, expected)
	})

	it('ignores flags for inner regexes', () => {
		const re = /a b c/gimsuy

		const expected = /.a b c/

		const actual = regex`.${re}`

		regexCompare(actual, expected)
	})
})

describe('escaping', () => {
	it('does not require escaping for regex control chars', () => {
		const expected = /\b\w\d\0(a)\1/

		const actual = regex`\b\w\d\0(a)\1`

		regexCompare(actual, expected)
	})

	it('does not require escaping for unicode properties', () => {
		const expected = /\p{C}/u

		const actual = regex('u')`\p{C}`

		regexCompare(actual, expected)
	})

	it('can escape ` and ${', () => {
		const expected = /`\${/

		const actual = regex`\`\${`

		regexCompare(actual, expected)
	})

	it('correctly escape ` or ${ with any odd number of \\', () => {
		const expected = /\\`\\\\\${/

		const actual = regex`\\\`\\\\\${`

		regexCompare(actual, expected)
	})

	it('can escape whitespace', () => {
		const expected = / \\\n/

		const actual = regex`      \ \\\
		`

		regexCompare(actual, expected)
	})

	it('does not escape whitespace with even number of slashes', () => {
		const expected = /\\\\\\/

		const actual = regex`      \\ \\\\
		`

		regexCompare(actual, expected)
	})

	it('$ as end-of-string', () => {
		const expected = /$/

		const actual = regex`$`

		regexCompare(actual, expected)
	})

	it('$ literal', () => {
		const expected = /\$/

		const actual = regex`\$`

		regexCompare(actual, expected)
	})

	it('${ literal', () => {
		const expected = /\${/

		const actual = regex`\${`

		regexCompare(actual, expected)
	})

	it('${ literal with multiple backslashes', () => {
		const expected = /\\\${/

		const actual = regex`\\\${`

		regexCompare(actual, expected)
	})
})
