import { chromium } from 'playwright'
import { preview } from 'vite'

const PORT = 7313
const TEXT = 'abc'
const FIELDS = ['plain', 'fn', 'schema']
const LABELS = {
  plain: 'no validator',
  fn: 'sync function validator',
  schema: 'sync Standard Schema validator',
}

const server = await preview({ preview: { port: PORT, strictPort: true } })
const url = server.resolvedUrls.local[0]

const browser = await chromium.launch()
let failed = false
try {
  const page = await browser.newPage()
  await page.goto(url)
  await page.waitForSelector('[data-testid="v2-schema"]')
  await page.waitForTimeout(200)

  for (const version of ['v1', 'v2']) {
    const counts = {}
    for (const field of FIELDS) {
      const before = await page.evaluate(([v, f]) => window.__renders[v][f], [version, field])
      await page.locator(`[data-testid="${version}-${field}"]`).pressSequentially(TEXT, { delay: 50 })
      await page.waitForTimeout(100)
      const after = await page.evaluate(([v, f]) => window.__renders[v][f], [version, field])
      counts[field] = after - before
    }

    const name = version === 'v1' ? '@tanstack/react-form 1.33.5' : '@tanstack/react-form 2.0.0-alpha.3'
    console.log(name)
    for (const field of FIELDS) {
      const extra = counts[field] > counts.plain
      if (extra) failed = true
      console.log(
        `  ${extra ? 'FAIL' : 'ok  '} ${LABELS[field].padEnd(32)} ${counts[field]} renders for ${TEXT.length} keystrokes`,
      )
    }
  }
} finally {
  await browser.close()
  await server.close()
}

console.log(
  failed
    ? '\nA field with a synchronous change validator renders more often per keystroke than the same field without one.'
    : '\nEvery field renders once per keystroke.',
)
process.exit(failed ? 1 : 0)
