import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "./App.tsx"

import "./index.css"

const rootId = "root"
const rootElement = document.getElementById(rootId)

if (!rootElement) {
  throw new Error(`Element with id "${rootId}" not found`)
}

const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
