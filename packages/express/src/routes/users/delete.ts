import { type Request, type Response } from "express"

import { firestore } from "@/firebase/config"
import { deleteUser } from "@/firebase/utils"

import type { User } from "@/shared/firestore/firestore.model"

type ReqQueries = Pick<User, "uid" | "email">

export const handleDeleteRequest = async (
  req: Request<undefined, undefined, undefined, ReqQueries>,
  res: Response
) => {
  const { uid, email } = req.query

  const usersRef = firestore.collection("users")
  const invitationsRef = firestore.collection("invitations")

  const userSnapshot = await usersRef.where("email", "==", email).get()
  const invitationSnapshot = await invitationsRef
    .where("email", "==", email)
    .get()

  if (userSnapshot.empty && invitationSnapshot.empty) {
    res.status(404).json({ error: "User not found" })
    return
  }

  if (!userSnapshot.empty) {
    const [userDoc] = userSnapshot.docs

    if (userDoc.id !== uid) {
      res.status(404).json({ error: "User not found" })
      return
    }

    await deleteUser(uid)
  }

  if (!invitationSnapshot.empty) {
    const [invitationDoc] = invitationSnapshot.docs

    if (userSnapshot.empty && invitationDoc.id !== uid) {
      res.status(404).json({ error: "User not found" })
      return
    }

    await invitationDoc.ref.delete()
  }

  res.status(200).json({ message: "User deleted successfully" })
}
