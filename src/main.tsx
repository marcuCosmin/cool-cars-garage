import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ToastContainer } from "react-toastify"

import { Provider as ReduxProvider } from "react-redux"
import { store } from "./redux/config.ts"

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
    <ReduxProvider store={store}>
      <App />
      <ToastContainer
        limit={1}
        position="bottom-right"
        hideProgressBar
        closeButton={false}
      />
    </ReduxProvider>
  </StrictMode>
)
