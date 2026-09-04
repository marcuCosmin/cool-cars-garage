import { Router } from "express"
import cors from "cors"

import { handleExport } from "./exports.post"

export const exportsRouter = Router()

const exportsCorsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  exposedHeaders: ["Content-Disposition"]
}

exportsRouter.options("/:resourceId", cors(exportsCorsOptions))
exportsRouter.post("/:resourceId", cors(exportsCorsOptions), handleExport)
