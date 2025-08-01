import { Router } from "express"
import cors from "cors"

import { updateCheckPointDate } from "./services/update-checkpoint-date"
import { handleIncidentSubmission } from "./services/submit-incident"
import { handleCheckSubmission } from "./services/submit-check"

export const carsRouter = Router()

carsRouter.options("/", cors({ origin: process.env.ALLOWED_ORIGIN }))
carsRouter.patch(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  updateCheckPointDate
)

carsRouter.options("/incidents", cors())
carsRouter.post("/incidents", cors(), handleIncidentSubmission)

carsRouter.options("/checks", cors())
carsRouter.post("/checks", cors(), handleCheckSubmission)
