export const regexCompare = (expected: RegExp, actual: RegExp) => {
	expect(actual.source).toEqual(expected.source)
	expect(actual.flags).toEqual(expected.flags)
}
