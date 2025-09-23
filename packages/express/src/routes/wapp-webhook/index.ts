import { Router } from "express"
import cors from "cors"

import { handleWappWebhookGetRequest } from "./get"

export const wappWebhook = Router()

wappWebhook.options("/", cors({ origin: "*" }))
wappWebhook.get("/", cors({ origin: "*" }), handleWappWebhookGetRequest)
