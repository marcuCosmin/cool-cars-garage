import { type Request, type Response } from "express"

import { UserRecord } from "firebase-admin/auth"
import { firebaseAuth, firestore } from "../../../firebase/config"

import { getRequestingAdminUid } from "../utils"

import type { User } from "../models"
import type { UserMetadata } from "../../../models"

export const handleGetRequest = async (req: Request, res: Response) => {
  try {
    const authorizationHeader = req.headers.authorization

    const requestingAdminUid = await getRequestingAdminUid(authorizationHeader)

    if (!requestingAdminUid) {
      res.status(403).json({
        users: [],
        error: "Unauthorized"
      })

      return
    }

    const { users: authUsers } = await firebaseAuth.listUsers()

    const usersMetadata = await firestore
      .collection("users")
      .where("__name__", "!=", requestingAdminUid)
      .get()

    if (usersMetadata.empty) {
      res.status(404).json({
        users: [],
        error: "Users metadata not found"
      })

      return
    }

    const users: User[] = usersMetadata.docs.map(doc => {
      const userMetadata = doc.data() as UserMetadata
      const matchingAuthUser = authUsers.find(
        ({ uid }) => uid === doc.id
      ) as UserRecord

      const { uid, email, displayName, phoneNumber, metadata } =
        matchingAuthUser

      return {
        creationTime: metadata.creationTime,
        lastSignInTime: metadata.lastSignInTime,
        uid,
        email,
        displayName,
        phoneNumber,
        ...userMetadata
      }
    })

    res.status(200).json({ users })
  } catch (error) {
    res.status(500).json({ users: [], error })
  }
}
