import { type Response, type NextFunction } from "express"
import { firebaseAuth, firestore } from "../firebase/config"

import type { UserMetadata, Request } from "../models"

const getUserMetadata = async (uid: string) => {
  const userRef = firestore.collection("users").doc(uid)
  const userDoc = await userRef.get()

  if (!userDoc.exists) {
    return null
  }

  return userDoc.data() as UserMetadata
}

export const authorizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    const isAdmin = userMetadata?.role === "admin"

    if (!isAdmin) {
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
