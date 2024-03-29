import { assert } from 'std/assert/mod.ts'
import { join } from 'std/path/mod.ts'
import { build, emptyDir } from 'https://deno.land/x/dnt@0.38.1/mod.ts'

const outDir = './npm'

await emptyDir(outDir)

const version = Deno.env.get('VERSION')

assert(version && /^\d+\.\d+\.\d+/.test(version))

await build({
	entryPoints: ['./src/mod.ts'],
	outDir,
	shims: {
		// see JS docs for overview and more options
		deno: true,
	},
	importMap: './deno.jsonc',
	package: {
		name: 'fancy-regex',
		version,
		description: 'JS/TS regexes with whitespace, comments, and interpolation!',
		scripts: {},
		author: 'https://github.com/lionel-rowe',
		license: 'MIT',
		repository: 'https://github.com/clearlylocal/fancy-regex',
	},
	postBuild() {
		// steps to run after building and before running the tests
		for (const fileName of ['LICENSE', 'README.md']) {
			Deno.copyFileSync(fileName, join(outDir, fileName))
		}
	},
})
