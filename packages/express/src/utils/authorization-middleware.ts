import { type Response, type NextFunction } from "express"
import { firebaseAuth, firestore } from "../firebase/config"

import type { Request, UserMetadata } from "../models"

const getUserMetadata = async (uid: string) => {
  const userRef = firestore.collection("users").doc(uid)
  const userDoc = await userRef.get()

  if (!userDoc.exists) {
    return null
  }

  return userDoc.data() as UserMetadata
}

const publicPathsConfig = {
  "/": ["GET"],
  "/mail": ["POST"],
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

  if (publicPathConfig?.[0] === "ALL" || req.method === "OPTIONS") {
    next()
    return
  }

  try {
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

    const isPublicRequest = publicPathConfig
      ? publicPathConfig.includes(req.method)
      : false
    const isAuthorizedPublicRequest = isPublicRequest && !!userMetadata?.role

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
