import { Router } from "express"
import cors from "cors"

import { handleFileUpload } from "./post"
import { handleFileDownload } from "./get"

export const filesRouter = Router()

filesRouter.options("/", cors({ origin: process.env.ALLOWED_ORIGIN }))
filesRouter.post(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleFileUpload
)
filesRouter.get(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleFileDownload
)
