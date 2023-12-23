# fancy-regex

JS/TS regexes with whitespace, comments, and interpolation!

[`npm i fancy-regex`](https://www.npmjs.com/package/fancy-regex)

## Usage

### `regex`

`` regex.<flags>`...` `` is used to create a fancy regex, which compiles to a native JavaScript `RegExp` at runtime. Fancy regexes strip all literal white space and comments starting with a `#`.

```ts
import { regex } from 'fancy-regex'
import { assertEquals, assertMatch, assertNotEquals, assertThrows } from 'std/assert/mod.ts'

const myFancyRegex = regex.v`
    hello,\ 🌎!        # space escaped with backslash becomes a literal space
`
assertEquals(myFancyRegex, /hello, 🌎!/v)
```

You can use `_` to create a flagless regex.

```ts
const flaglessRe = regex._`flagless`
assertEquals(flaglessRe, /flagless/)
```

If you're using TypeScript, flags must be supplied in alphabetical order to pass type checking.

```ts
// OK!
regex.gimsvy`👍`

// @ts-expect-error Property 'yvsmig' does not exist on type <...>
regex.yvsmig`⛔`
```

If you like, you can pass string flags or use an options object instead.

```ts
const globalRe = regex('gv')`
    💩+    # with unicode enabled, this matches by codepoint
`
assertEquals(globalRe, /💩+/gv)

const withOptionsObject = regex({
    unicodeSets: true,
    global: true,
})`
    ^
        💩+    # with unicode enabled, this matches by codepoint
    $
`
assertEquals(withOptionsObject, /^💩+$/gv)
```

Interpolation is simple, with escaping of interpolated strings handled automatically.

```ts
const interpolatedRe = regex.iv`
    ${'[abc]'}        # seamlessly interpolate strings...
    .
    ${/[abc]/}        # ...and other regexes
    .
    ${/[abc]/g}       # inner flags are ignored when interpolated
`
assertEquals(interpolatedRe, /\[abc\].[abc].[abc]/iv)
```

Regex escapes (`\b`, `\w`, etc.) are supported.

```ts
const escapedRe = regex.iv`
    \w\d\b\0\\        # look Mom, no double escaping!
    \r\n\t\x20        # "\x20" matches a literal space
`
assertEquals(escapedRe, /\w\d\b\0\\\r\n\t\x20/iv)
```

You can also escape literal white space, hash symbols `#`, or the sequence `${`, by preceding them with a backslash.

```ts
const escapedRe2 = regex.v`\#\ \$\{`
assertEquals(escapedRe2, /# \$\{/v)
assertMatch('# ${', escapedRe2)
```

If you want to interpolate a string you want to be interpreted as raw regex source fragment, you'll need to wrap it in a `RegexFragment` first.

For example, we would need to use this approach if we wanted to dynamically interpolate create a quantifier `{3}` that isn't syntactically valid as a standalone regex, such that the desired result is `/^a{3}$/v`:

```ts
const expected = /^a{3}$/v
const attempt1 = regex.v`^a${'{3}'}$`

assertNotEquals(attempt1, expected)
assertEquals(attempt1, /^a\{3\}$/v)

assertThrows(
    () => {
        const attempt2 = regex.v`^a${regex.v`{3}`}$`
    },
    SyntaxError,
    'Invalid regular expression: /{3}/v: Nothing to repeat',
)

import { RegexFragment } from 'fancy-regex'

const success = regex.v`^a${new RegexFragment('{3}')}$`

assertEquals(success, expected)
assertMatch('aaa', success)
```

Interpolated arrays are automatically converted to non-capturing groups, sorted by length. Duplicate values, `false`, and nullish values are removed.

```ts
const withArray = regex.v`
    ${['aa', 'bbb', '.', new RegexFragment('.'), /./, false, null, undefined]}
`
assertEquals(withArray, /(?:bbb|aa|\.|.)/v)
```

---

`fancy-regex` also provides the utility function `unwrap`.

### `unwrap`

Removes start-of-string and end-of-string matchers from a regex. Useful for interpolating or repurposing single-match regexes:

```ts
import { unwrap } from 'fancy-regex'

const singleHex = /^[0-9a-f]$/vi

const hex = unwrap(singleHex)
assertEquals(hex, /[0-9a-f]/vi)

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
assertEquals(singleUuid, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/v)

const multipleUuid = unwrap(singleUuid, 'gv')
assertEquals(multipleUuid, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gv)
```
