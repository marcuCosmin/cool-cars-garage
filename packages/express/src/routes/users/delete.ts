import { type Request, type Response } from "express"

import { firestore } from "@/backend/firebase/config"
import {
  deleteUser,
  getFirestoreDoc,
  getFirestoreDocs
} from "@/backend/firebase/utils"

import type { DeleteUserQueryParams } from "@/globals/requests/requests.model"

export const handleDeleteRequest = async (
  req: Request<undefined, undefined, undefined, DeleteUserQueryParams>,
  res: Response
) => {
  const { uid } = req.query

  const user = getFirestoreDoc({
    collection: "users",
    docId: uid
  })

  if (!user) {
    res.status(404).json({ error: "User not found" })
    return
  }

  await deleteUser(uid)

  const [existingInvitation] = await getFirestoreDocs({
    collection: "invitations",
    queries: [["uid", "==", uid]]
  })

  if (existingInvitation) {
    await firestore
      .collection("invitations")
      .doc(existingInvitation.id)
      .delete()
  }

  res.status(200).json({ message: "User deleted successfully" })
}
