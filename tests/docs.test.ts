import { basename, normalize, relative, resolve } from 'std/path/mod.ts'
import { expandGlob } from 'std/fs/expand_glob.ts'
import { globToRegExp } from 'std/path/glob.ts'

export const rootDir = resolve('.')

export const include = ['**/*.md'] as const satisfies readonly string[]
export const exclude = ['npm/**'] as const satisfies readonly string[]

const excludeRes = exclude.map((x) => globToRegExp(x))

const IS_NPM_BUILD_DIR = rootDir.includes('/npm/')

if (!IS_NPM_BUILD_DIR) {
	Deno.test('Docs', async (t) => {
		for (const glob of include) {
			for await (const { path: _path, isFile } of expandGlob(glob)) {
				if (!isFile) continue

				const path = normalize(relative(rootDir, _path))

				if (excludeRes.some((re) => re.test(path))) continue

				await t.step(path, async () => {
					const md = await Deno.readTextFile(path)
					const code = [
						...md.matchAll(/(?<=(?:^|\n)(?:`{3,})(?:ts|typescript|js|javascript)\n)[^]+?(?=\n```)/gi),
					]
						.flat()
						.join('\n\n')

					// @ts-ignore NodeJS lacking `File`
					const file = new File([code], `${basename(path, '.md')}.ts`, { type: 'application/typescript' })

					const url = URL.createObjectURL(file)

					try {
						await import(url)
					} finally {
						URL.revokeObjectURL(url)
					}
				})
			}
		}
	})
}
