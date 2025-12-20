import { Router } from "express"
import cors from "cors"

import { handleUserReinvitation } from "./reinvite/post"
import { handleAuthTokenGeneration } from "./generate-auth-token/get"
import { handleGetRequest } from "./get"
import { handleUserPostRequest } from "./post"
import { handleDeleteRequest } from "./delete"
import { handleUserPatchRequest } from "./patch"
import { handleUserRegistration } from "./register/post"

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
  handleUserPostRequest
)
usersRouter.delete(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleDeleteRequest
)
usersRouter.patch(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleUserPatchRequest
)

usersRouter.options("/reinvite", cors({ origin: process.env.ALLOWED_ORIGIN }))
usersRouter.post(
  "/reinvite",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleUserReinvitation
)

usersRouter.options("/register", cors({ origin: process.env.ALLOWED_ORIGIN }))
usersRouter.post(
  "/register",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleUserRegistration
)

usersRouter.options("/generate-auth-token", cors({ origin: "*" }))
usersRouter.get(
  "/generate-auth-token",
  cors({ origin: "*" }),
  handleAuthTokenGeneration
)

usersRouter.options(
  "/update-active-state",
  cors({ origin: process.env.ALLOWED_ORIGIN })
)
import { handleUserActiveStateUpdate } from "./update-active-state/post"
usersRouter.post(
  "/update-active-state",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  handleUserActiveStateUpdate
)
