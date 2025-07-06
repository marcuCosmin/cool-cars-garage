import { type Response, type NextFunction } from "express"
import { firebaseAuth } from "../../firebase/config"

import type { Request } from "../../models"

export const reportsAuthorizationMiddleware = async (
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

    if (!uid) {
      res.status(403).json({
        error: "Unauthorized"
      })

      return
    }

    req.uid = uid
    next()
  } catch (error) {
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
