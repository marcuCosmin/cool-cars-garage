import { Router } from "express"
import cors from "cors"

import { updateCheckPointDate } from "./services/update-checkpoint-date"
import { handleIncidentSubmission } from "./incidents/post"
import { handleCheckSubmission } from "./checks/post"
import { handleFaultResolve } from "./faults/patch"
import { handleIncidentResolve } from "./incidents/patch"
import { handleCarChecksExports } from "./checks/exports/get"

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
  "/faults/:faultId",
  cors({ origin: process.env.ALLOWED_ORIGIN })
)
carsRouter.patch(
  "/faults/:faultId",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleFaultResolve
)

carsRouter.options(
  "/incidents/:incidentId",
  cors({ origin: process.env.ALLOWED_ORIGIN })
)
carsRouter.patch(
  "/incidents/:incidentId",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleIncidentResolve
)

carsRouter.options(
  "/checks/exports",
  cors({ origin: process.env.ALLOWED_ORIGIN })
)
carsRouter.get(
  "/checks/exports",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleCarChecksExports
)
