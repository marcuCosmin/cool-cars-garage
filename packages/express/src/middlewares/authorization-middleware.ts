import { type Response, type NextFunction } from "express"

import { firebaseAuth } from "@/firebase/config"
import { getAuthUser, getFirestoreDoc } from "@/firebase/utils"

import type { Request } from "@/models"

import type { UserDoc } from "@/globals/firestore/firestore.model"

const publicPathsConfig = {
  "/": ["GET"],
  "/mail": ["POST"],
  "/users/register": ["POST"],
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

  const authorizationHeader = req.headers.authorization
  const idToken = authorizationHeader?.split("Bearer ")[1]

  if (!idToken) {
    res.status(403).json({
      error: "Unauthorized"
    })

    return
  }

  const { uid } = await firebaseAuth.verifyIdToken(idToken)

  const user = await getAuthUser(uid)

  if (user?.disabled) {
    res.status(403).json({
      error: "User account is deactivated"
    })

    return
  }

  const userDoc = await getFirestoreDoc({
    collection: "users",
    docId: uid
  })

  const role = userDoc?.role

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

  req.authorizedUser = {
    uid,
    email: user?.email as string,
    isActive: !user?.disabled,
    ...(userDoc as UserDoc)
  }
  next()
}
