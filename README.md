# Readme

JS/TS regexes with whitespace, comments, and interpolation!

## Usage

```ts
import regex from 'fancy-regex'

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

console.log(myCaseInsensitiveRegex)
// /^abc\x42{5}def\w\d\b\0\\...\r\n\t\x20$/i

const myRegexWithOptions = regex({
	unicode: true,
	global: true,
})`
	^
		💩+    # with unicode enabled, this matches by codepoint
	$
`

console.log(myRegexWithOptions)
// /^💩+$/gu
```
