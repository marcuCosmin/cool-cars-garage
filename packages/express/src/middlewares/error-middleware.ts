import { type Request, type Response, type NextFunction } from "express"

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(error)

  res.status(500).json({ error: error.message || "Internal Server Error" })
}
