import { Router } from "express"

import { handleGetRequest } from "./services/get"
import { handleDeleteRequest } from "./services/delete"
import { handleInviteRequest } from "./services/invite"
import { handleCreateRequest } from "./services/create"
import { handleSendVerificationSMSRequest } from "./services/send-verification-sms"
import { handleUpdatePhoneNumberRequest } from "./services/update-phone-number"

export const usersRouter = Router()

usersRouter.get("/", handleGetRequest)
usersRouter.delete("/", handleDeleteRequest)
usersRouter.post("/", handleCreateRequest)
usersRouter.post("/invite", handleInviteRequest)
usersRouter.post("/send-verification-sms", handleSendVerificationSMSRequest)
usersRouter.patch("/update-phone-number", handleUpdatePhoneNumberRequest)
