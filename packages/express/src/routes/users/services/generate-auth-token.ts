import { type Response } from "express"

import { firebaseAuth } from "../../../firebase/config"

import type { Request } from "../../../models"

type ReqBody = {
  password: string
  firstName: string
  lastName: string
  invitationId: string
}

const getAuthUser = async (uid: string) => {
  try {
    const user = await firebaseAuth.getUser(uid)
    return user
  } catch {
    return null
  }
}

export const handleAuthTokenGeneration = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  try {
    const uid = req.uid as string

    const authUser = await getAuthUser(uid)

    if (!authUser) {
      res.status(404).json({ error: "Invalid uid" })
      return
    }

    const customToken = await firebaseAuth.createCustomToken(uid)

    res.status(200).json({ customToken })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: error.message
      })

      return
    }

    res.status(500).json({ error: `An unexpected error occurred: ${error}` })
  }
}
