import { Router } from "express"
import cors from "cors"

import { handleExport } from "./exports.post"

export const exportsRouter = Router()

exportsRouter.options(
  "/:resourceId",
  cors({ origin: process.env.ALLOWED_ORIGIN })
)
exportsRouter.post(
  "/:resourceId",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleExport
)
