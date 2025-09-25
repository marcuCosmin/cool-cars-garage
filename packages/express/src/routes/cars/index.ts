import { Router } from "express"
import cors from "cors"

import { updateCheckPointDate } from "./services/update-checkpoint-date"
import { handleIncidentSubmission } from "./incidents/post"
import { handleCheckSubmission } from "./checks/post"
import { handleFaultsPatch } from "./faults/patch"
import { handleIncidentPatch } from "./incidents/patch"

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

carsRouter.options(
  "/checks/faults",
  cors({ origin: process.env.ALLOWED_ORIGIN })
)
carsRouter.patch(
  "/checks/faults",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleFaultsPatch
)

carsRouter.options(
  "/checks/incidents",
  cors({ origin: process.env.ALLOWED_ORIGIN })
)
carsRouter.patch(
  "/checks/incidents",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleIncidentPatch
)
