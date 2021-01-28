# fancy-regex

JS/TS regexes with whitespace, comments, and interpolation!

[`npm i fancy-regex`](https://www.npmjs.com/package/fancy-regex)

## Usage

### `regex`

`regex` is used to create a fancy regex, which compiles to a native JavaScript `RegExp` at runtime.

```ts
import regex from 'fancy-regex'

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

`regex` also provides two utility functions, `regex.exact` and `regex.unwrap`.

### `regex.exact`

Turns a string into a regex exactly matching itself. For example, `regex.exact('.[xy]')` matches the exact string `".[xy]"`, rather than matching a single character followed by an x or y. This can be useful, for example, sanitizing user for insertion into a regex.

```ts
regex.exact('.[xy]').test('.[xy]') // ⇒ true
regex.exact('.[xy]').test('ax')    // ⇒ false

const textToFind = regex('gi')`
    \b
    ${regex.exact(userInput)}
    \b
`
```

### `regex.unwrap`

Removes start-of-string and end-of-string matchers from a regex. Useful for interpolating or repurposing single-match regexes:

```ts
const singleHex = /^[0-9a-f]$/i

const hex = regex.unwrap(singleHex)
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

const multipleUuid = regex.unwrap(singleUuid, 'g')
// ⇒ /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g
```
