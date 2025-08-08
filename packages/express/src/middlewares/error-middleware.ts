import { type Request, type Response } from "express"

export const errorMiddleware = (error: Error, req: Request, res: Response) => {
  console.error(error.message)

  res.status(500).json({ error: "Internal Server Error" })
}
