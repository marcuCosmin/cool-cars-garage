import { Router } from "express"
import cors from "cors"
import { rateLimit } from "express-rate-limit"

import { handlePostRequest } from "./services/post"

const contactRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 3,
  statusCode: 429,
  message: { error: "Too many requests, please try again later." }
})

export const mailRouter = Router()

mailRouter.use(cors({ origin: process.env.MAIL_ALLOWED_ORIGIN }))
mailRouter.options("/")
mailRouter.post("/", contactRateLimiter, handlePostRequest)
