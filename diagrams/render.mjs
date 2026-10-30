// 把本目录下的插图源渲染成 PNG。
// 用法（在本目录执行）：
//   PLAYWRIGHT_CORE=<path-to-playwright-core/index.mjs> \
//   CHROMIUM_PATH=<path-to-chrome-headless-shell> \
//   node render.mjs [文件名 ...]
import { mkdir, readdir } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const output = resolve(here, '..', 'images')
await mkdir(output, { recursive: true })

const coreSpecifier = process.env.PLAYWRIGHT_CORE ?? 'playwright-core'
const coreImport = coreSpecifier.startsWith('.') || coreSpecifier.includes('\\') || coreSpecifier.includes('/')
  ? pathToFileURL(resolve(coreSpecifier)).href
  : coreSpecifier
const { chromium } = await import(coreImport)

const filter = process.argv.slice(2)
const all = (await readdir(here)).filter((name) => /^fig-.*\.html$/.test(name))
const files = filter.length === 0 ? all : all.filter((name) => filter.includes(basename(name, '.html')))
if (files.length === 0) throw new Error(`no figure sources matched ${filter.join(', ')}`)

const executablePath = process.env.CHROMIUM_PATH
const browser = await chromium.launch(executablePath === undefined ? {} : { executablePath })
const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1.5 })

for (const file of files) {
  await page.goto(pathToFileURL(join(here, file)).href)
  await page.evaluate(() => document.fonts.ready)
  for (const figure of await page.locator('section.figure').all()) {
    const id = await figure.getAttribute('id')
    if (id === null) continue
    const name = id.replace(/^fig-/, '')
    await figure.screenshot({ path: join(output, `${name}.png`) })
    console.log(`rendered ${name}.png`)
  }
}

await browser.close()
