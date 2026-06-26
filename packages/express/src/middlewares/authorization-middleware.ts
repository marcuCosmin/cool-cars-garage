import { type Response, type NextFunction } from "express"

import { firebaseAuth } from "@/backend/firebase/config"
import { getAuthUser, getFirestoreDoc } from "@/backend/firebase/utils"

import type { Request } from "@/models"

import type { UserDoc } from "@/globals/firestore/firestore.model"

type RoutePermission = {
  path: string
  methods: string[]
}

const publicPaths: RoutePermission[] = [
  { path: "/", methods: ["GET"] },
  { path: "/mail", methods: ["POST"] },
  { path: "/users/register", methods: ["POST"] },
  { path: "/wapp-webhook", methods: ["GET", "POST"] }
]

const rolePermissions: Record<"driver" | "manager", RoutePermission[]> = {
  driver: [
    { path: "/users/generate-auth-token", methods: ["GET"] },
    { path: "/cars/incidents", methods: ["POST"] },
    { path: "/cars/checks", methods: ["POST"] }
  ],
  manager: [
    { path: "/cars/checks/exports", methods: ["GET"] },
    { path: "/files", methods: ["POST", "GET"] },
    { path: "/cars/faults/:faultId", methods: ["PATCH"] },
    { path: "/cars/incidents/:incidentId", methods: ["PATCH"] }
  ]
}

const pathParamPattern = /:[^/]+/g
const anyPathSegment = "[^/]+"

type IsPathPermittedProps = {
  permissions: RoutePermission[]
  reqPath: string
  reqMethod: string
}
const isPathPermitted = ({
  permissions,
  reqPath,
  reqMethod
}: IsPathPermittedProps) =>
  permissions.some(({ path, methods }) => {
    const isSamePath = new RegExp(
      `^${path.replace(pathParamPattern, anyPathSegment)}$`
    ).test(reqPath)
    const methodAllowed = methods.includes(reqMethod)

    return isSamePath && methodAllowed
  })

type IsRoleAuthorizedProps = Partial<Pick<UserDoc, "role">> & {
  reqPath: string
  reqMethod: string
}
const isRoleAuthorized = ({
  role,
  reqPath,
  reqMethod
}: IsRoleAuthorizedProps) => {
  if (role === "mechanic") {
    return false
  }

  if (role === "admin") {
    return true
  }

  if (!role || !(role in rolePermissions)) {
    return false
  }

  const permissions = rolePermissions[role]

  return isPathPermitted({ permissions, reqPath, reqMethod })
}

export const authorizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isPublicPath = isPathPermitted({
    permissions: publicPaths,
    reqPath: req.path,
    reqMethod: req.method
  })

  if (isPublicPath || req.method === "OPTIONS") {
    next()
    return
  }

  const authorizationHeader = req.headers.authorization
  const idToken = authorizationHeader?.split("Bearer ").pop()

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

  if (!isRoleAuthorized({ role, reqPath: req.path, reqMethod: req.method })) {
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
