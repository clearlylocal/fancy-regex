export const regexCompare = (actual: RegExp, expected: RegExp) => {
	expect(actual.source).toEqual(expected.source)
	expect(actual.flags).toEqual(expected.flags)
}
