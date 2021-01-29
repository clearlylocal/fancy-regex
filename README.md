# fancy-regex

JS/TS regexes with whitespace, comments, and interpolation!

[`npm i fancy-regex`](https://www.npmjs.com/package/fancy-regex)

## Usage

### `regex`

`regex` is used to create a fancy regex, which compiles to a native JavaScript `RegExp` at runtime.

```ts
import { regex } from 'fancy-regex'

const myFancyRegex = regex`
    hello,\ world!        # escaped whitespace with backslash
`
// ⇒ /hello, world!/
```

If you don’t need to use any flags, the `regex` function is directly callable on template strings. Otherwise, you can pass the flags to `regex` first:

```ts
const myGlobalRegex = regex('g')`🌎`
// ⇒ /🌎/g
```

If you like, you can pass an options object instead of string flags:

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

Interpolation is simple:

```ts
const myInterpolatedRegex = regex('i')`
    ^
        ${'abc'}          # seamlessly interpolate strings...
        ${myFancyRegex}   # ...and other regexes
        ${myGlobalRegex}  # inner flags are ignored when interpolated

        \w\d\b\0\\        # look Mom, no double escaping!

        ...

        \r\n\t\x20        # you can also use "\x20" to match a literal space
    $
`
// ⇒ /abchello, world!🌎\w\d\b\0\\...\r\n\t\x20/i
```

---

`regex` also provides some utility functions — `regexEscape`, `exact`, and `unwrap`.

### `regexEscape` and `exact`

`regexEscape` escapes arbitrary string data for interpolation into a regex, exactly matching the input string. `exact` works similarly, except it returns a regex without the need for interpolation.

For example, `exact('.[xy]')` matches the exact string `".[xy]"`, rather than matching a single character followed by an x or y. These functions can be useful, for example, sanitizing user for insertion into a regex.

```ts
// sanitizing user input
const textMatcher = regex('gi')`
    \b
    ${regexEscape(searchText)}
    \b
`

// using `exact`
exact('.[xy]').test('.[xy]') // ⇒ true
exact('.[xy]').test('ax')    // ⇒ false

// or with flags...
exact('.[xy]', 'i').test('.[XY]') // ⇒ true
```

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
