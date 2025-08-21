import { Router } from "express"
import cors from "cors"

import { handleUserInvitation } from "./invite"
import { handleAuthTokenGeneration } from "./generate-auth-token"

import { handleGetRequest } from "./services/get"
import { handleDeleteRequest } from "./services/delete"
import { handleCreateRequest } from "./services/create"
import { handleSendVerificationSMSRequest } from "./services/send-verification-sms"
import { handleUpdatePhoneNumberRequest } from "./services/update-phone-number"

export const usersRouter = Router()

usersRouter.get("/", handleGetRequest)

usersRouter.options("/generate-auth-token", cors({ origin: "*" }))
usersRouter.get(
  "/generate-auth-token",
  cors({ origin: "*" }),
  handleAuthTokenGeneration
)
usersRouter.options("/invite", cors({ origin: process.env.ALLOWED_ORIGIN }))
usersRouter.post(
  "/invite",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleUserInvitation
)

usersRouter.delete("/", handleDeleteRequest)

usersRouter.post("/", handleCreateRequest)

usersRouter.post("/send-verification-sms", handleSendVerificationSMSRequest)

usersRouter.patch("/update-phone-number", handleUpdatePhoneNumberRequest)
