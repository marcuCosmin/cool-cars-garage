import { type Response, type NextFunction } from "express"

import { firebaseAuth } from "@/firebase/config"
import { getUserDoc } from "@/firebase/utils"

import type { Request } from "@/models"

const publicPathsConfig = {
  "/": ["GET"],
  "/mail": ["POST"],
  "/users": ["POST"],
  "/wapp-webhook": ["GET", "POST"]
}

const roleBasedPathsConfig: Record<
  "driver" | "manager",
  Record<string, string[]>
> = {
  driver: {
    "/users/generate-auth-token": ["GET"],
    "/cars/incidents": ["POST"],
    "/cars/checks": ["POST"]
  },
  manager: {
    "/cars/checks/faults": ["PATCH"],
    "/cars/checks/exports": ["GET"]
  }
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
    const authorizationHeader = req.headers.authorization
    const idToken = authorizationHeader?.split("Bearer ")[1]

    if (!idToken) {
      res.status(403).json({
        error: "Unauthorized"
      })

      return
    }

    const { uid } = await firebaseAuth.verifyIdToken(idToken)

    const userMetadata = await getUserDoc(uid)

    const role = userMetadata?.role

    const pathConfig =
      role !== "admin" && role ? roleBasedPathsConfig[role] : null
    const pathConfigMethod = pathConfig?.[req.path]

    const isAuthorized = pathConfigMethod?.includes(req.method)

    if (role !== "admin" && !isAuthorized) {
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
