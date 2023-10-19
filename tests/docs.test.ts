import { assert, assertEquals } from 'std/assert/mod.ts'
import { exact, regex, RegexFragment, unwrap } from '../src/mod.ts'

Deno.test('examples from docs', async (t) => {
	const uuids = [
		'00ac35a2-44ff-4694-84b3-f378d8f0cd0e',
		'edf9e977-1df2-45cc-8144-40572e9632ad',
		'cf214337-2de5-4eea-8075-6d584b06722d',
		'a96e7e75-ef4a-4666-a115-8bddbc237af0',
		'6dd855de-eb80-4d98-8d6f-46d3bc447e9a',
	]

	const myFancyRegex = regex()`
		hello,\ world!        # escaped whitespace with backslash
	`

	const myGlobalRegex = regex('gu')`🌎`

	const myInterpolatedRegex = regex('iu')`
		^
			${'abc.'}         # seamlessly interpolate strings...
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

	await t.step('myFancyRegex', () => {
		const expected = /hello, world!/

		assertEquals(expected, myFancyRegex)
	})

	await t.step('myInterpolatedRegex', () => {
		const expected = /^abc\.hello, world!🌎\w\d\b\0\\...\r\n\t\x20$/iu

		assertEquals(expected, myInterpolatedRegex)
	})

	await t.step('myRegexWithOptions', () => {
		const expected = /^💩+$/gu

		assertEquals(expected, myRegexWithOptions)
	})

	await t.step('exact', () => {
		assert(exact('.[xy]').test('.[xy]') === true)
		assert(exact('.[xy]').test('ax') === false)
	})

	await t.step('rawInterpolation', () => {
		const expected = /./
		const rawInterpolation = regex()`
			${new RegexFragment('.')}
		`
		assertEquals(expected, rawInterpolation)
	})

	await t.step('withArray old', () => {
		const expected = /(?:a|b|\.|.)/
		const withArray = regex()`
			${['a', 'b', '.', new RegexFragment('.'), /./]}
		`
		assertEquals(expected, withArray)
	})

	await t.step('withArray', () => {
		const expected = new RegExp(String.raw`(?:bbb|aa|\.|.)`, 'v')
		const withArray = regex.v`
			${['aa', 'bbb', '.', new RegexFragment('.'), /./, false, null, undefined]}
		`

		assertEquals(expected, withArray)
	})

	await t.step('uuid (unwrap)', async (t) => {
		const singleHex = /^[0-9a-f]$/i

		const hex = unwrap(singleHex)

		const singleUuid = regex()`
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

		const multipleUuid = unwrap(singleUuid, 'g')

		await t.step('hex', () => {
			assertEquals(hex, /[0-9a-f]/i)
		})

		await t.step('singleUuid', () => {
			uuids.forEach((uuid) => {
				assert(singleUuid.test(uuid))
			})
		})

		await t.step('multipleUuid', () => {
			assert(uuids.join(' ').match(multipleUuid)?.length === uuids.length)
		})
	})
})
