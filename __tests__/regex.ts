import { LazyAlternation, regex } from '../src'
import { regexCompare } from './helpers/regexCompare'

describe('sanity checks', () => {
	it('error on invalid regex source', () => {
		expect(() => regex()`[`).toThrow(SyntaxError)
	})

	it('error on invalid regex source (unicode)', () => {
		expect(() => regex('u')`\p`).toThrow(SyntaxError)
	})

	it('no error on valid regex source', () => {
		expect(() => regex()``).not.toThrow()
	})

	it('no error on unnecessary escape (without unicode flag)', () => {
		expect(() => regex()`\p`).not.toThrow()
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

		const actual = regex()``

		regexCompare(expected, actual)
	})

	it('empty regex with non-capturing group', () => {
		const expected = /(?:)/

		const actual = regex()`(?:)`

		regexCompare(expected, actual)
	})

	it('simple', () => {
		const expected = /.+/

		const actual = regex()`.+`

		regexCompare(expected, actual)
	})

	it('complex', () => {
		const expected = /\0\b\t\r\n\\/

		const actual = regex()`
			\0\b\t\r\n\\ # comment
		`

		regexCompare(expected, actual)
	})
})

describe('string flags', () => {
	it('no flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('gimsuy')``

		regexCompare(expected, actual)
	})

	it('all flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('gimsuy')``

		regexCompare(expected, actual)
	})

	it('stable ordering of flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('yusmig')``

		regexCompare(expected, actual)
	})

	it('stable ordering of flags #2', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('gimsuy')``

		regexCompare(expected, actual)
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

		regexCompare(expected, actual)
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

		regexCompare(expected, actual)
	})
})

describe('whitespace collapsing', () => {
	it('collapse to empty regex', () => {
		const expected = /(?:)/

		const actual = regex()`


		`

		regexCompare(expected, actual)
	})

	it('collapse to content-only', () => {
		const expected = /hello_world/

		const actual = regex()`hello

		_
		world

		`

		regexCompare(expected, actual)
	})

	it('cannot use literal space', () => {
		expect(regex()`^ $`.test(' ')).toBe(false)
	})

	it('can use \\x20 to match space', () => {
		expect(regex()`^\x20$`.test(' ')).toBe(true)
	})
})

describe('comment removal', () => {
	it('removes comments at start', () => {
		const expected = /text/

		const actual = regex()`# comment
		text
		#comment`

		regexCompare(expected, actual)
	})

	it('removes comments at start of line', () => {
		const expected = /text/

		const actual = regex()`text
		# comment`

		regexCompare(expected, actual)
	})

	it('removes comments from hash symbol to EoL', () => {
		const expected = /abc/

		const actual = regex()`
			a # A
			b # B
			c # C ########## ...
		`
		regexCompare(expected, actual)
	})

	it('can use \\# to escape hash symbol', () => {
		const expected = /a#Ab#Bc#C/

		const actual = regex()`
			a \# A
			b \# B
			c \# C
		`

		regexCompare(expected, actual)
	})

	it('cannot use \\\\# to escape hash symbol', () => {
		const expected = /ab\\c\\#Cd\\\\/

		const actual = regex()`
			a # A
			b \\# B
			c \\\# C
			d \\\\# D
		`

		regexCompare(expected, actual)
	})
})

describe('interpolation', () => {
	it('interpolates numbers', () => {
		const expected = /.{5}/

		const actual = regex()`.{${2 + 3}}`

		regexCompare(expected, actual)
	})

	it('interpolates strings', () => {
		const str = 'hello_world'

		const expected = /.hello_world/

		const actual = regex()`.${str}`

		regexCompare(expected, actual)
	})

	it('preserves whitespace in interpolated string', () => {
		const crlf = '\r\n'
		const tab = '	'
		const space = ' '

		const expected = /\r\n	 /

		const actual = regex()`${crlf}${tab}${space}`

		regexCompare(expected, actual)
	})

	it('interpolates other regexes', () => {
		const re = /a b c/

		const expected = /.a b c/

		const actual = regex()`.${re}`

		regexCompare(expected, actual)
	})

	it('ignores flags for inner regexes', () => {
		const re = /a b c/gimsuy

		const expected = /.a b c/

		const actual = regex()`.${re}`

		regexCompare(expected, actual)
	})

	it('interpolates alternation by length descending', () => {
		const strs = ['hello_world', 'hello', 'hello_']

		const expected = /(?:hello_world|hello_|hello)/

		const actual = regex()`${strs}`

		regexCompare(expected, actual)
	})

	it('interpolates lazy alternation by length ascending', () => {
		const strs = ['hello_world', 'hello', 'hello_']

		const expected = /(?:hello|hello_|hello_world)/

		const actual = regex()`${new LazyAlternation(strs)}`

		regexCompare(expected, actual)
	})

	it('removes duplicates from alternation groups', () => {
		const strs = ['a', 'hello', 'hello', 'hello']

		const expected = /(?:hello|a)/

		const actual = regex()`${strs}`

		regexCompare(expected, actual)
	})

	it('removes nullish or false from alternation groups', () => {
		const arr = ['a', null, false, undefined, , 'b']

		const expected = /(?:a|b)/

		const actual = regex()`${arr}`

		regexCompare(expected, actual)
	})

	it('doesn’t remove 0, NaN, or empty string from alternation groups', () => {
		const arr = ['a', '', 'b', 0, -0, BigInt(0), 'NaN']

		const expected = /(?:NaN|a|b|0|)/

		const actual = regex()`${arr}`

		regexCompare(expected, actual)
	})
})

describe('escaping', () => {
	it('does not require escaping for regex control chars', () => {
		const expected = /\b\w\d\0(a)\1/

		const actual = regex()`\b\w\d\0(a)\1`

		regexCompare(expected, actual)
	})

	it('does not require escaping for unicode properties', () => {
		const expected = /\p{C}/u

		const actual = regex('u')`\p{C}`

		regexCompare(expected, actual)
	})

	it('can escape ` and ${', () => {
		const expected = /`\${_\${`/

		const actual = regex()`\`\${_\${\``

		regexCompare(expected, actual)
	})

	it('correctly escape ` or ${ with any odd number of \\', () => {
		const expected = /\\`\\\\\${/

		const actual = regex()`\\\`\\\\\${`

		regexCompare(expected, actual)
	})

	it('can escape spaces', () => {
		const expected = / \\  /

		const actual = regex()`      \ \\\ \ `

		regexCompare(expected, actual)
	})

	it('does not escape whitespace with even number of slashes', () => {
		const expected = /\\\\\\/

		const actual = regex()`      \\ \\\\
		`

		regexCompare(expected, actual)
	})

	it('$ as end-of-string', () => {
		const expected = /$/

		const actual = regex()`$`

		regexCompare(expected, actual)
	})

	it('$ literal', () => {
		const expected = /\$/

		const actual = regex()`\$`

		regexCompare(expected, actual)
	})

	it('${ literal', () => {
		const expected = /\${/

		const actual = regex()`\${`

		regexCompare(expected, actual)
	})

	it('${ literal with multiple backslashes', () => {
		const expected = /\\\${/

		const actual = regex()`\\\${`

		regexCompare(expected, actual)
	})

	it('escaped spaces', () => {
		const pairs = [
			[/a b/, regex()`a\ b`],
			[/a\\b/, regex()`a\\ b`],
			[/a\\ b/, regex()`a\\\ b`],
			[/a bc d/, regex()`a\ bc\ d`],
			[/a   b/, regex()`a\ \ \ b`],
		]

		pairs.forEach(([expected, actual]) => {
			regexCompare(expected, actual)
		})
	})

	it('escaped hashes', () => {
		const pairs = [
			[/a#b/, regex()`a\#b`],
			[/a\\/, regex()`a\\#b`],
			[/a\\#b/, regex()`a\\\#b`],
			[/a#bc/, regex()`a\#bc#d`],
			[/a#bc#d/, regex()`a\#bc\#d`],
			[/a/, regex()`a#bc#d`],
			[/a#bc d/, regex()`a\#bc\ d`],
		]

		pairs.forEach(([expected, actual]) => {
			regexCompare(expected, actual)
		})
	})
})
