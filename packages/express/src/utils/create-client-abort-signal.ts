import type { Response } from "express"

export const createClientAbortSignal = (res: Response) => {
  const abortController = new AbortController()

  const abortOnClientDisconnect = () => {
    if (res.writableFinished) {
      return
    }

    abortController.abort()
  }

  if (res.closed) {
    abortOnClientDisconnect()
  } else {
    res.on("close", abortOnClientDisconnect)
  }

  return abortController.signal
}
