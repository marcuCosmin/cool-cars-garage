import { type Request, type Response } from "express"

import { firestore } from "@/firebase/config"
import { deleteUser } from "@/firebase/utils"

import type { User } from "@/shared/firestore/firestore.model"

type ReqQueries = Pick<User, "uid">

export const handleDeleteRequest = async (
  req: Request<undefined, undefined, undefined, ReqQueries>,
  res: Response
) => {
  const { uid } = req.query

  const invitationsRef = firestore.collection("invitations")
  const invitationSnapshot = await invitationsRef.where("uid", "==", uid).get()

  if (!invitationSnapshot.empty) {
    const deleteBatch = firestore.batch()

    invitationSnapshot.forEach(doc => {
      deleteBatch.delete(doc.ref)
    })

    await deleteBatch.commit()
  }

  await deleteUser(uid)

  res.status(200).json({ message: "User deleted successfully" })
}
