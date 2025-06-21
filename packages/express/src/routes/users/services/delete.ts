import { type Request, type Response } from "express"

import { firebaseAuth, firestore } from "../../../firebase/config"

import { getRequestingAdminUid } from "../utils"

import type { User } from "../models"

type ReqQueries = Pick<User, "uid">

export const handleDeleteRequest = async (
  req: Request<undefined, undefined, undefined, ReqQueries>,
  res: Response
) => {
  try {
    const authorizationHeader = req.headers.authorization

    const requestingAdminUid = await getRequestingAdminUid(authorizationHeader)

    if (!requestingAdminUid) {
      res.status(403).json({
        error: "Unauthorized"
      })

      return
    }

    const { uid } = req.query

    await firebaseAuth.deleteUser(uid)
    await firestore.collection("users").doc(uid).delete()

    res.status(200).json({ message: "User deleted successfully" })
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
