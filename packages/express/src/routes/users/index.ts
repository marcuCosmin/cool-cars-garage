import { Router } from "express"
import cors from "cors"

import { handleGetRequest } from "./services/get"
import { handleDeleteRequest } from "./services/delete"
import { handleInviteRequest } from "./services/invite"
import { handleCreateRequest } from "./services/create"
import { handleSendVerificationSMSRequest } from "./services/send-verification-sms"
import { handleUpdatePhoneNumberRequest } from "./services/update-phone-number"
import { handleAuthTokenGeneration } from "./services/generate-auth-token"

export const usersRouter = Router()

usersRouter.use(cors({ origin: process.env.ALLOWED_ORIGIN }))

usersRouter.options("*")

usersRouter.get("/", handleGetRequest)
usersRouter.get("/generate-auth-token", handleAuthTokenGeneration)

usersRouter.delete("/", handleDeleteRequest)

usersRouter.post("/", handleCreateRequest)
usersRouter.post("/invite", handleInviteRequest)
usersRouter.post("/send-verification-sms", handleSendVerificationSMSRequest)

usersRouter.patch("/update-phone-number", handleUpdatePhoneNumberRequest)
