import { type Request } from "express"

import { getFirestoreDocs } from "@/firebase/utils"
import { firestore } from "@/firebase/config"

import type { Response } from "@/models"

import type { ReiniviteUserPayload } from "@/globals/requests/requests.model"

import { inviteUser } from "../utils"

export const handleUserReinvitation = async (
  req: Request<undefined, undefined, ReiniviteUserPayload>,
  res: Response
) => {
  const { uid } = req.body

  const [invitation] = await getFirestoreDocs({
    collection: "invitations",
    queries: [["uid", "==", uid]]
  })

  if (!invitation?.isActive) {
    res.status(400).json({
      error: "Invalid uid"
    })
    return
  }

  await firestore.collection("invitations").doc(invitation.id).delete()
  await inviteUser(invitation)

  res.status(200).json({
    message: "Invitation resent successfully"
  })
}
