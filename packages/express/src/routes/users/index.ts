import { Router } from "express"
import cors from "cors"

import { handleUserInvitation } from "./invite/post"
import { handleAuthTokenGeneration } from "./generate-auth-token/get"
import { handleGetRequest } from "./get"
import { handleCreateRequest } from "./post"
import { handleDeleteRequest } from "./delete"
import { handleUserUpdate } from "./put"

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
usersRouter.delete(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleDeleteRequest
)
usersRouter.put(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleUserUpdate
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

usersRouter.post("/send-verification-sms", handleSendVerificationSMSRequest)

usersRouter.patch("/update-phone-number", handleUpdatePhoneNumberRequest)
