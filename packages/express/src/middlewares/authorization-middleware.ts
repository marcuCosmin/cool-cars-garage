import { type Response, type NextFunction } from "express"

import { firebaseAuth } from "@/firebase/config"
import { getUserMetadata } from "@/firebase/utils"

import type { Request } from "@/models"

const publicPathsConfig = {
  "/": ["GET"],
  "/mail": ["POST"],
  "/users": ["POST"]
}

const usersPublicPathsConfig = {
  "/users/generate-auth-token": ["GET"],
  "/cars/incidents": ["POST"],
  "/cars/checks": ["POST"]
}

export const authorizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const publicPathConfig =
    publicPathsConfig[req.path as keyof typeof publicPathsConfig]

  if (publicPathConfig?.includes(req.method) || req.method === "OPTIONS") {
    next()
    return
  }

  try {
    const usersPublicPathConfig =
      usersPublicPathsConfig[req.path as keyof typeof usersPublicPathsConfig]
    const authorizationHeader = req.headers.authorization
    const idToken = authorizationHeader?.split("Bearer ")[1]

    if (!idToken) {
      res.status(403).json({
        error: "Unauthorized"
      })

      return
    }

    const { uid } = await firebaseAuth.verifyIdToken(idToken)

    const userMetadata = await getUserMetadata(uid)

    const isUserPublicRequest = usersPublicPathConfig?.includes(req.method)

    const isAuthorizedPublicRequest =
      isUserPublicRequest && !!userMetadata?.role

    const isAuthorizedProtectedRequest = userMetadata?.role === "admin"

    if (!isAuthorizedProtectedRequest && !isAuthorizedPublicRequest) {
      res.status(403).json({
        error: "Unauthorized"
      })

      return
    }

    req.uid = uid
    next()
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        error: error.message
      })

      return
    }

    res.status(500).json({
      error: "An unexpected error occurred"
    })
  }
}
