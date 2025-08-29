import { Router } from "express"
import cors from "cors"

import { handleUserInvitation } from "./invite/post"
import { handleAuthTokenGeneration } from "./generate-auth-token/get"
import { handleCreateRequest } from "./post"

import { handleGetRequest } from "./get"
import { handleDeleteRequest } from "./services/delete"
import { handleSendVerificationSMSRequest } from "./services/send-verification-sms"
import { handleUpdatePhoneNumberRequest } from "./services/update-phone-number"

export const usersRouter = Router()

usersRouter.options("/", cors({ origin: process.env.ALLOWED_ORIGIN }))
usersRouter.get(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleGetRequest
)
usersRouter.post(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleCreateRequest
)

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

usersRouter.post("/send-verification-sms", handleSendVerificationSMSRequest)

usersRouter.patch("/update-phone-number", handleUpdatePhoneNumberRequest)
