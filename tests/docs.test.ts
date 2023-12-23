import { join, resolve } from 'std/path/mod.ts'

const IS_NPM_BUILD_DIR = resolve('.').includes('/npm/')

Deno.test({
	ignore: IS_NPM_BUILD_DIR,
	name: 'examples from docs',
	async fn(t) {
		const docFilePaths = ['./README.md']

		for (const path of docFilePaths) {
			// @ts-ignore Node lacking `Array#with`
			const tsFileName = path.split('/').at(-1)!.split('.').with(-1, 'ts').join('.')
			await t.step(`${path} ⇒ ${tsFileName}`, async () => {
				const md = await Deno.readTextFile(IS_NPM_BUILD_DIR ? join('..', path) : path)
				const code = [...md.matchAll(/(?<=(?:^|\n)(?:`{3,})(?:ts|typescript|js|javascript)\n)[^]+?(?=\n```)/gi)]
					.flat()
					.join('\n\n')

				// @ts-ignore Node lacking `File`
				const file = new File([code], tsFileName, { type: 'application/typescript' })

				const url = URL.createObjectURL(file)

				try {
					await import(url)
				} finally {
					URL.revokeObjectURL(url)
				}
			})
		}
	},
})
