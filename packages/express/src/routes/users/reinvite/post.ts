import { type Request } from "express"

import { getFirestoreDoc, getFirestoreDocs } from "@/firebase/utils"
import { firestore } from "@/firebase/config"

import type { Response } from "@/models"

import type { ReiniviteUserPayload } from "@/shared/requests/requests.model"

import { inviteUser } from "../utils"

export const handleUserReinvitation = async (
  req: Request<undefined, undefined, ReiniviteUserPayload>,
  res: Response
) => {
  const { uid } = req.body

  const user = await getFirestoreDoc({
    collection: "users",
    docId: uid
  })

  if (!user) {
    res.status(404).json({ error: "User not found" })
    return
  }

  const [existingInvitation] = await getFirestoreDocs({
    collection: "invitations",
    queries: [["uid", "==", uid]]
  })

  if (existingInvitation?.isActive) {
    res.status(400).json({
      error: "An invitation for this email already exists"
    })
    return
  }

  await inviteUser(existingInvitation)

  await firestore.collection("invitations").doc(existingInvitation.id).delete()

  res.status(200).json({
    message: "User reinvited successfully"
  })
}
