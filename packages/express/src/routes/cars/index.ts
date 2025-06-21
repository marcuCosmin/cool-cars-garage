import { Router } from "express"
import { updateCheckPointDate } from "./services/update-checkpoint-date"

export const carsRouter = Router()

carsRouter.patch("/", updateCheckPointDate)
