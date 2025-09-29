import { Router } from "express"
import cors from "cors"

import { handleWappWebhookGetRequest } from "./get"
import { handleWappWebhookPostRequest } from "./post"

export const wappWebhook = Router()

wappWebhook.options("/", cors({ origin: "*" }))
wappWebhook.get("/", cors({ origin: "*" }), handleWappWebhookGetRequest)
wappWebhook.post("/", cors({ origin: "*" }), handleWappWebhookPostRequest)
