import { Router } from "express"
import cors from "cors"

import { exportWarningsHeader } from "@/globals/requests/requests.const"

import { handleExport } from "./exports.post"

export const exportsRouter = Router()

const exportsCorsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  exposedHeaders: ["Content-Disposition", exportWarningsHeader]
}

exportsRouter.options("/:resourceId", cors(exportsCorsOptions))
exportsRouter.post("/:resourceId", cors(exportsCorsOptions), handleExport)
