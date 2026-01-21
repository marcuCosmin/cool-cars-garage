import { type Response } from "express"

import { firebaseAuth } from "@/backend/firebase/config"
import { getAuthUser } from "@/backend/firebase/utils"

import type { Request } from "@/models"

export const handleAuthTokenGeneration = async (
  req: Request,
  res: Response
) => {
  const uid = req.authorizedUser?.uid as string

  const authUser = await getAuthUser(uid)

  if (!authUser) {
    res.status(400).json({ error: "Invalid uid" })
    return
  }

  const authToken = await firebaseAuth.createCustomToken(uid)

  res.status(200).json({ authToken })
}
