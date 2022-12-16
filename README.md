# fancy-regex

JS/TS regexes with whitespace, comments, and interpolation!

[`npm i fancy-regex`](https://www.npmjs.com/package/fancy-regex)

## Usage

### `regex`

`regex()` is used to create a fancy regex, which compiles to a native JavaScript `RegExp` at runtime.

```ts
import { regex } from 'fancy-regex'

const myFancyRegex = regex()`
    hello,\ world!        # escaped whitespace with backslash
`
// ⇒ /hello, world!/
```

You can pass flags to `regex` first:

```ts
const myGlobalRegex = regex('gu')`🌎`
// ⇒ /🌎/gu
```

If you like, you can also pass an options object instead of string flags:

```ts
const myRegexWithOptions = regex({
    unicode: true,
    global: true,
})`
    ^
        💩+    # with unicode enabled, this matches by codepoint
    $
`
// ⇒ /^💩+$/gu
```

Interpolation is simple, with escaping of interpolated strings handled automatically:

```ts
const myInterpolatedRegex = regex('iu')`
    ^
        ${'abc.'}         # seamlessly interpolate strings...
        ${myFancyRegex}   # ...and other regexes
        ${myGlobalRegex}  # inner flags are ignored when interpolated

        \w\d\b\0\\        # look Mom, no double escaping!

        ...

        \r\n\t\x20        # you can also use "\x20" to match a literal space
    $
`
// ⇒ /^abc\.hello, world!🌎\w\d\b\0\\...\r\n\t\x20$/iu
```

If you want to interpolate a string you want to be interpreted as raw regex source, you'll need to wrap it in a `RegexFragment` first:

```ts
import { RegexFragment } from 'fancy-regex'

const rawInterpolation = regex()`
	${new RegexFragment('.')}
`
// ⇒ /./
```

Interpolated arrays are automatically converted to non-capturing groups:

```ts
import { RegexFragment } from 'fancy-regex'

const withArray = regex()`
	${['a', 'b', '.', new RegexFragment('.'), /./]}
`
// ⇒ /(?:a|b|\.|.)/
```

---

`regex` also provides the utility function `unwrap`.

### `unwrap`

Removes start-of-string and end-of-string matchers from a regex. Useful for interpolating or repurposing single-match regexes:

```ts
const singleHex = /^[0-9a-f]$/i

const hex = unwrap(singleHex)
// ⇒ /[0-9a-f]/i

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
// ⇒ /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const multipleUuid = unwrap(singleUuid, 'g')
// ⇒ /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g
```

---

### Experimental Proxy API

To enable the experimental [Proxy](https://developer.mozilla.org/en-us/docs/Web/JavaScript/Reference/Global_Objects/Proxy)-based API, which provides syntax sugar for setting flags, change the `import` statement as follows:

```diff
- import { regex } from 'fancy-regex'
+ import { proxy as regex } from 'fancy-regex'
```

You can then use the syntax `` regex.<flags>`...` `` as an additional alternative to `` regex('<flags>')`...` ``. For example:

```ts
regex.gi`
	${'I have global and ignore-case flags set!'}
`

regex._`
	${'_ can be used to indicate no flags'}
`
```

Note that, if you're using TypeScript, the type checking for this syntax requires that the flags are given in alphabetical order:

```ts
// OK!
regex.gimsuy`👍`

// Property 'yusmig' does not exist on type [...]
regex.yusmig`⛔`
```
