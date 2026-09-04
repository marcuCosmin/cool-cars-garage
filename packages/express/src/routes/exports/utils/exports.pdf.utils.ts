import fs from "fs"
import path from "path"

import { launch as launchPuppeteerBrowser, type Browser } from "puppeteer"

const PDF_GENERATION_CONCURRENCY_LIMIT = 2
const BROWSER_IDLE_TIMEOUT_MS = 60 * 1000

const rawMarker = Symbol("rawHtml")

export type RawHtml = { [rawMarker]: string }

export type Interpolated =
  | string
  | number
  | false
  | null
  | undefined
  | RawHtml
  | Interpolated[]

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}

const escapeHtml = (value: string) =>
  value.replace(/["'&<>]/g, character => htmlEscapes[character])

/**
 * Marks a string as trusted markup so the `html` tag embeds it verbatim.
 * Only ever call this with developer-authored markup - never with stored or
 * request data.
 */
export const raw = (value: string): RawHtml => ({ [rawMarker]: value })

const renderHtml = ({ [rawMarker]: value }: RawHtml) => value

const stringify = (value: Interpolated): string => {
  if (value === false || value === null || value === undefined) {
    return ""
  }

  if (Array.isArray(value)) {
    return value.map(stringify).join("")
  }

  if (typeof value === "object") {
    return value[rawMarker]
  }

  return escapeHtml(String(value))
}

/**
 * Builds markup with every interpolated value escaped by default, so stored
 * data such as a driver's notes always renders as plain text. Nested `html`
 * fragments are embedded as-is, so values must never be escaped by hand.
 *
 * Escaping only covers element content and quoted attribute values. Data must
 * never be interpolated into a `href`/`src`, an unquoted attribute, or a
 * `<script>`/`<style>` body, where injection needs none of the escaped
 * characters.
 */
export const html = (
  strings: TemplateStringsArray,
  ...values: Interpolated[]
): RawHtml =>
  raw(
    strings.reduce(
      (result, string, index) =>
        `${result}${stringify(values[index - 1])}${string}`
    )
  )

let browserPromise: Promise<Browser> | null = null
let activeBrowser: Browser | null = null
let idleBrowserTimeout: NodeJS.Timeout | null = null

const launchBrowser = async () => {
  const browser = await launchPuppeteerBrowser({
    headless: "shell",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  })

  activeBrowser = browser

  browser.once("disconnected", () => {
    if (activeBrowser !== browser) {
      return
    }

    browserPromise = null
    activeBrowser = null
  })

  return browser
}

const loadBrowser = async () => {
  if (!browserPromise) {
    browserPromise = launchBrowser()
  }

  try {
    return await browserPromise
  } catch (error) {
    browserPromise = null

    throw error
  }
}

const closeIdleBrowser = () => {
  const idleBrowser = activeBrowser

  idleBrowserTimeout = null
  browserPromise = null
  activeBrowser = null

  idleBrowser?.close().catch(closeError => console.log(closeError))
}

const scheduleIdleBrowserClose = () => {
  idleBrowserTimeout = setTimeout(closeIdleBrowser, BROWSER_IDLE_TIMEOUT_MS)

  idleBrowserTimeout.unref()
}

const cancelIdleBrowserClose = () => {
  if (!idleBrowserTimeout) {
    return
  }

  clearTimeout(idleBrowserTimeout)

  idleBrowserTimeout = null
}

let activeGenerations = 0
const pendingGenerations: (() => void)[] = []

const acquireGenerationSlot = async () => {
  if (activeGenerations < PDF_GENERATION_CONCURRENCY_LIMIT) {
    activeGenerations++

    return
  }

  await new Promise<void>(resolve => pendingGenerations.push(resolve))
}

const releaseGenerationSlot = () => {
  const startNextGeneration = pendingGenerations.shift()

  if (startNextGeneration) {
    startNextGeneration()

    return
  }

  activeGenerations--

  if (!activeGenerations) {
    scheduleIdleBrowserClose()
  }
}

const cssPath = path.join(__dirname, "exports.pdf.css")
const styles = fs.readFileSync(cssPath, "utf-8")

const getExportHTML = (body: RawHtml) =>
  html` <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          ${raw(styles)}
        </style>
      </head>

      <body>
        <header class="mb-6 text-center font-semibold">
          Cool Cars South Coast LTD
        </header>
        ${body}
      </body>
    </html>`

type RenderPDFProps = {
  browser: Browser
  body: RawHtml
}

const renderPDF = async ({ browser, body }: RenderPDFProps) => {
  const page = await browser.newPage()

  try {
    await page.setJavaScriptEnabled(false)
    await page.setRequestInterception(true)

    page.on("request", request =>
      request.isNavigationRequest() || request.url().startsWith("data:")
        ? request.continue()
        : request.abort()
    )

    await page.setContent(renderHtml(getExportHTML(body)), {
      waitUntil: "load"
    })

    return await page.pdf({ format: "A4", printBackground: true })
  } finally {
    await page.close().catch(closeError => console.log(closeError))
  }
}

export const generatePDF = async (body: RawHtml) => {
  cancelIdleBrowserClose()

  await acquireGenerationSlot()

  try {
    const browser = await loadBrowser()

    const pdf = await renderPDF({ browser, body })

    return pdf
  } finally {
    releaseGenerationSlot()
  }
}
