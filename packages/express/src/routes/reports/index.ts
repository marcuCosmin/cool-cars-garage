import { Router } from "express"

import { handleIncidentCreation } from "./services/create-incident"

export const reportsRouter = Router()

reportsRouter.options("/incidents")
reportsRouter.post("/incidents", handleIncidentCreation)
