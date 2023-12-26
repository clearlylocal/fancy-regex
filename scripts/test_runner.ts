import { globToRegExp } from 'std/path/glob.ts'
import { normalize } from 'std/path/normalize.ts'
import { relative } from 'std/path/relative.ts'
import { exclude, include, rootDir } from '../tests/docs.test.ts'

const WATCH_FLAG = '--watch'
const watch = Deno.args.includes(WATCH_FLAG)

const includeRes = include.map((x) => globToRegExp(x))
const excludeRes = exclude.map((x) => globToRegExp(x))

const testCmd = new Deno.Command(Deno.execPath(), { args: ['test', '-A', ...(watch ? [WATCH_FLAG] : []), './tests'] })

let proc = testCmd.spawn()

if (!watch) Deno.exit()

for await (const event of Deno.watchFs(rootDir)) {
	if (event.kind !== 'modify') continue
	for (const _path of event.paths) {
		const path = normalize(relative(rootDir, _path))

		if (!includeRes.some((re) => re.test(path))) continue
		if (excludeRes.some((re) => re.test(path))) continue

		proc.kill()
		proc = testCmd.spawn()
	}
}
