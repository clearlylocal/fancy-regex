import { assert, assertEquals, assertThrows } from 'std/assert/mod.ts'
import { LazyAlternation, regex } from '../src/mod.ts'

Deno.test('sanity checks', async (t) => {
	await t.step('error on invalid regex source', () => {
		assertThrows(() => regex()`[`, SyntaxError)
	})

	await t.step('error on invalid regex source (unicode)', () => {
		assertThrows(() => regex('u')`\p`, SyntaxError)
	})

	await t.step('no error on valid regex source', () => {
		// assert doesn't throw
		regex()``
	})

	await t.step('no error on unnecessary escape (without unicode flag)', () => {
		// assert doesn't throw
		regex()`\p`
	})

	await t.step('instanceof Function when not called (flags)', () => {
		assert(regex('') instanceof Function)
	})

	await t.step('instanceof Function when not called (options)', () => {
		assert(regex({}) instanceof Function)
	})

	await t.step('instanceof RegExp when called (flags)', () => {
		assert(regex('')`` instanceof RegExp)
	})

	await t.step('instanceof RegExp when called (options)', () => {
		assert(regex({})`` instanceof RegExp)
	})

	await t.step('instanceof Function when not called (no args)', () => {
		assert(regex() instanceof Function)
	})

	await t.step('instanceof RegExp when called (no args)', () => {
		assert(regex()`` instanceof RegExp)
	})
})

Deno.test('no flags', async (t) => {
	await t.step('empty regex', () => {
		const expected = /(?:)/

		const actual = regex()``

		assertEquals(expected, actual)
	})

	await t.step('empty regex with non-capturing group', () => {
		const expected = /(?:)/

		const actual = regex()`(?:)`

		assertEquals(expected, actual)
	})

	await t.step('simple', () => {
		const expected = /.+/

		const actual = regex()`.+`

		assertEquals(expected, actual)
	})

	await t.step('complex', () => {
		const expected = /\0\b\t\r\n\\/

		const actual = regex()`
			\0\b\t\r\n\\ # comment
		`

		assertEquals(expected, actual)
	})
})

Deno.test('string flags', async (t) => {
	await t.step('no flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('gimsuy')``

		assertEquals(expected, actual)
	})

	await t.step('all flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('gimsuy')``

		assertEquals(expected, actual)
	})

	await t.step('stable ordering of flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('yusmig' as 'gimsuy')``

		assertEquals(expected, actual)
	})

	await t.step('stable ordering of flags #2', () => {
		const expected = /(?:)/gimsuy

		const actual = regex('gimsuy')``

		assertEquals(expected, actual)
	})

	await t.step('reject invalid flags', () => {
		assertThrows(() => regex('_')``, SyntaxError)
	})

	await t.step('reject duplicate flags', () => {
		assertThrows(() => regex('gg' as 'g')``, SyntaxError)
	})
})

Deno.test('options object', async (t) => {
	await t.step('no flags', () => {
		const expected = /(?:)/

		const actual = regex({})``

		assertEquals(expected, actual)
	})

	await t.step('all flags', () => {
		const expected = /(?:)/gimsuy

		const actual = regex({
			global: true,
			ignoreCase: true,
			multiline: true,
			sticky: true,
			dotAll: true,
			unicode: true,
		})``

		assertEquals(expected, actual)
	})
})

Deno.test('whitespace collapsing', async (t) => {
	await t.step('collapse to empty regex', () => {
		const expected = /(?:)/

		const actual = regex()`


		`

		assertEquals(expected, actual)
	})

	await t.step('collapse to content-only', () => {
		const expected = /hello_world/

		const actual = regex()`hello

		_
		world

		`

		assertEquals(expected, actual)
	})

	await t.step('cannot use literal space', () => {
		assert(regex()`^ $`.test(' ') === false)
	})

	await t.step('can use \\x20 to match space', () => {
		assert(regex()`^\x20$`.test(' ') === true)
	})
})

Deno.test('comment removal', async (t) => {
	await t.step('removes comments at start', () => {
		const expected = /text/

		const actual = regex()`# comment
		text
		#comment`

		assertEquals(expected, actual)
	})

	await t.step('removes comments at start of line', () => {
		const expected = /text/

		const actual = regex()`text
		# comment`

		assertEquals(expected, actual)
	})

	await t.step('removes comments from hash symbol to EoL', () => {
		const expected = /abc/

		const actual = regex()`
			a # A
			b # B
			c # C ########## ...
		`
		assertEquals(expected, actual)
	})

	await t.step('can use \\# to escape hash symbol', () => {
		const expected = /a#Ab#Bc#C/

		const actual = regex()`
			a \# A
			b \# B
			c \# C
		`

		assertEquals(expected, actual)
	})

	await t.step('cannot use \\\\# to escape hash symbol', () => {
		const expected = /ab\\c\\#Cd\\\\/

		const actual = regex()`
			a # A
			b \\# B
			c \\\# C
			d \\\\# D
		`

		assertEquals(expected, actual)
	})
})

Deno.test('interpolation', async (t) => {
	await t.step('interpolates numbers', () => {
		const expected = /.{5}/

		const actual = regex()`.{${2 + 3}}`

		assertEquals(expected, actual)
	})

	await t.step('interpolates strings', () => {
		const str = 'hello_world'

		const expected = /.hello_world/

		const actual = regex()`.${str}`

		assertEquals(expected, actual)
	})

	await t.step('preserves whitespace in interpolated string', () => {
		const crlf = '\r\n'
		const tab = '	'
		const space = ' '

		const expected = /\r\n	 /

		const actual = regex()`${crlf}${tab}${space}`

		assertEquals(expected, actual)
	})

	await t.step('interpolates other regexes', () => {
		const re = /a b c/

		const expected = /.a b c/

		const actual = regex()`.${re}`

		assertEquals(expected, actual)
	})

	await t.step('ignores flags for inner regexes', () => {
		const re = /a b c/gimsuy

		const expected = /.a b c/

		const actual = regex()`.${re}`

		assertEquals(expected, actual)
	})

	await t.step('interpolates alternation by length descending', () => {
		const strs = ['hello_world', 'hello', 'hello_']

		const expected = /(?:hello_world|hello_|hello)/

		const actual = regex()`${strs}`

		assertEquals(expected, actual)
	})

	await t.step('interpolates lazy alternation by length ascending', () => {
		const strs = ['hello_world', 'hello', 'hello_']

		const expected = /(?:hello|hello_|hello_world)/

		const actual = regex()`${new LazyAlternation(strs)}`

		assertEquals(expected, actual)
	})

	await t.step('removes duplicates from alternation groups', () => {
		const strs = ['a', 'hello', 'hello', 'hello']

		const expected = /(?:hello|a)/

		const actual = regex()`${strs}`

		assertEquals(expected, actual)
	})

	await t.step('removes nullish or false from alternation groups', () => {
		const arr = ['a', null, false, undefined, , 'b']

		const expected = /(?:a|b)/

		const actual = regex()`${arr}`

		assertEquals(expected, actual)
	})

	await t.step('doesn’t remove 0, NaN, or empty string from alternation groups', () => {
		const arr = ['a', '', 'b', 0, -0, BigInt(0), 'NaN']

		const expected = /(?:NaN|a|b|0|)/

		const actual = regex()`${arr}`

		assertEquals(expected, actual)
	})
})

Deno.test('escaping', async (t) => {
	await t.step('does not require escaping for regex control chars', () => {
		const expected = /\b\w\d\0(a)\1/

		const actual = regex()`\b\w\d\0(a)\1`

		assertEquals(expected, actual)
	})

	await t.step('does not require escaping for unicode properties', () => {
		const expected = /\p{C}/u

		const actual = regex('u')`\p{C}`

		assertEquals(expected, actual)
	})

	await t.step('can escape ` and ${', () => {
		const expected = /`\${_\${`/

		const actual = regex()`\`\${_\${\``

		assertEquals(expected, actual)
	})

	await t.step('correctly escape ` or ${ with any odd number of \\', () => {
		const expected = /\\`\\\\\${/

		const actual = regex()`\\\`\\\\\${`

		assertEquals(expected, actual)
	})

	await t.step('can escape spaces', () => {
		// deno-lint-ignore no-regex-spaces
		const expected = / \\  /

		const actual = regex()`      \ \\\ \ `

		assertEquals(expected, actual)
	})

	await t.step('does not escape whitespace with even number of slashes', () => {
		const expected = /\\\\\\/

		const actual = regex()`      \\ \\\\
		`

		assertEquals(expected, actual)
	})

	await t.step('$ as end-of-string', () => {
		const expected = /$/

		const actual = regex()`$`

		assertEquals(expected, actual)
	})

	await t.step('$ literal', () => {
		const expected = /\$/

		const actual = regex()`\$`

		assertEquals(expected, actual)
	})

	await t.step('${ literal', () => {
		const expected = /\${/

		const actual = regex()`\${`

		assertEquals(expected, actual)
	})

	await t.step('${ literal with multiple backslashes', () => {
		const expected = /\\\${/

		const actual = regex()`\\\${`

		assertEquals(expected, actual)
	})

	await t.step('escaped spaces', () => {
		const pairs = [
			[/a b/, regex()`a\ b`],
			[/a\\b/, regex()`a\\ b`],
			[/a\\ b/, regex()`a\\\ b`],
			[/a bc d/, regex()`a\ bc\ d`],
			// deno-lint-ignore no-regex-spaces
			[/a   b/, regex()`a\ \ \ b`],
		]

		pairs.forEach(([expected, actual]) => {
			assertEquals(expected, actual)
		})
	})

	await t.step('escaped hashes', () => {
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
			assertEquals(expected, actual)
		})
	})
})
