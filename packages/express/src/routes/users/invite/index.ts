import { type Response } from "express"

import { firestore } from "@/firebase/config"
import { isEmailUsed } from "@/firebase/utils"

import { sendMail } from "@/utils/send-mail"

import type { Request } from "@/models"

import type { DriverMetadata, UserMetadata, User } from "@/shared/models"

type ReqBody = Pick<User, "email"> &
  Pick<UserMetadata, "role"> &
  Omit<DriverMetadata, "role" | "birthDate">

export const handleInviteRequest = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  const {
    email,
    role,
    isTaxiDriver,
    badgeNumber,
    badgeExpirationDate,
    dbsUpdate
  } = req.body

  const emailIsUsed = await isEmailUsed(email as string)

  if (emailIsUsed) {
    res.status(400).json({
      error: "The provided email is already in use"
    })

    return
  }

  const existingInvite = await firestore
    .collection("invitations")
    .where("email", "==", email)
    .get()

  if (!existingInvite.empty) {
    res.status(400).json({
      error: "An invitation for this email already exists"
    })

    return
  }

  const createdInvite = await firestore.collection("invitations").add({
    email,
    role
  })

  await sendMail({
    to: email as string,
    subject: "Invitation to join Cool Cars Garage",
    html: `
        <div>Hello,</div>
        <br/>
        <div>You have been invited to join <a href="${process.env.ALLOWED_ORIGIN}">Cool Cars Garage</a>.</div>
        <div>Click <a href="${process.env.ALLOWED_ORIGIN}/sign-up?invitationId=${createdInvite.id}">here</a> to accept the invitation.</div>
        <br/>
        <div>Thanks,</div>
        <b>Cool Cars Garage</b> team
      `
  })

  res.status(200).json({ message: "Invitation sent successfully" })
}
