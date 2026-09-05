import { type Request, type Response, type NextFunction } from "express"

import type { Error } from "@/models"

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loggableError = error.shouldForwardToClient ? error.cause : error

  if (loggableError) {
    console.log(loggableError)
  }

  if (res.headersSent) {
    next(error)
    return
  }

  if (error.shouldForwardToClient) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(500).json({ error: "Something went wrong, please try again" })
}
