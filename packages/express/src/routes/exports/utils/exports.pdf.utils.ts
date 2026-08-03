import fs from "fs"
import path from "path"

import { launch as launchBrowser, type Browser } from "puppeteer"

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

let browser: Browser | null = null

const loadBrowser = async () => {
  if (browser?.connected) {
    return browser
  }

  browser = await launchBrowser({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-crash-reporter",
      "--disable-crashpad",
      "--user-data-dir=/var/www/.chrome-user-data"
    ]
  })

  return browser
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

export const generatePDF = async (body: RawHtml) => {
  const browser = await loadBrowser()

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
    await page.close()
  }
}
