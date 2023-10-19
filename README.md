# fancy-regex

JS/TS regexes with whitespace, comments, and interpolation!

[`npm i fancy-regex`](https://www.npmjs.com/package/fancy-regex)

## Usage

### `regex`

`` regex.<flags>`...` `` is used to create a fancy regex, which compiles to a native JavaScript `RegExp` at runtime.

```ts
import { regex } from 'fancy-regex'

const myFancyRegex = regex.v`
    hello,\ 🌎!        # escaped whitespace with backslash
`
// ⇒ /hello, 🌎!/v
```

You can use `_` to get a flagless regex:

```ts
const myGlobalRegex = regex._`flagless`
// ⇒ /flagless/
```

If you like, you can pass string flags or use an options object instead:

```ts
const myRegexWithStringFlags = regex('gv')`
    ^
        💩+    # with unicode enabled, this matches by codepoint
    $
`
// ⇒ /^💩+$/gv

const myRegexWithOptions = regex({
    unicodeSets: true,
    global: true,
})`
    ^
        💩+    # with unicode enabled, this matches by codepoint
    $
`
// ⇒ /^💩+$/gv
```

Interpolation is simple, with escaping of interpolated strings handled automatically:

```ts
const myInterpolatedRegex = regex.iv`
    ^
        ${'abc.'}         # seamlessly interpolate strings...
        ${myFancyRegex}   # ...and other regexes
        ${myGlobalRegex}  # inner flags are ignored when interpolated

        \w\d\b\0\\        # look Mom, no double escaping!

        ...

        \r\n\t\x20        # you can also use "\x20" to match a literal space
    $
`
// ⇒ /^abc\.hello, world!🌎\w\d\b\0\\...\r\n\t\x20$/iv
```

If you want to interpolate a string you want to be interpreted as raw regex source, you'll need to wrap it in a `RegexFragment` first:

```ts
import { RegexFragment } from 'fancy-regex'

const rawInterpolation = regex.v`
	${new RegexFragment('.')}
`
// ⇒ /./v
```

Interpolated arrays are automatically converted to non-capturing groups, sorted by length and with duplicates, `false`, and nullish values removed:

```ts
import { RegexFragment } from 'fancy-regex'

const withArray = regex.v`
	${['aa', 'bbb', '.', new RegexFragment('.'), /./, false, null, undefined]}
`
// ⇒ /(?:bbb|aa|\.|.)/v
```

---

`regex` also provides the utility function `unwrap`.

### `unwrap`

Removes start-of-string and end-of-string matchers from a regex. Useful for interpolating or repurposing single-match regexes:

```ts
const singleHex = /^[0-9a-f]$/vi

const hex = unwrap(singleHex)
// ⇒ /[0-9a-f]/vi

const singleUuid = regex.v`
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
// ⇒ /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/v

const multipleUuid = unwrap(singleUuid, 'gv')
// ⇒ /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gv
```

Note that, if you're using TypeScript, the type checking for this syntax requires that the flags are given in alphabetical order:

```ts
// OK!
regex.gimsvy`👍`

// Property 'yvsmig' does not exist on type [...]
regex.yvsmig`⛔`
```
