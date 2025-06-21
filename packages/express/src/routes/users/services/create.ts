import { type Request, type Response } from "express"

import { firebaseAuth, firestore } from "../../../firebase/config"

import type { User } from "../models"

type ReqBody = {
  password: string
  firstName: string
  lastName: string
  invitationId: string
}

export const handleCreateRequest = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  try {
    const { password, firstName, lastName, invitationId } = req.body

    const existingInvite = await firestore
      .collection("invitations")
      .doc(invitationId)
      .get()

    if (!existingInvite.exists) {
      res.status(400).json({
        error: "The provided invitation ID is invalid"
      })

      return
    }

    const { email, role } = existingInvite.data() as Pick<
      User,
      "email" | "role"
    >

    const { uid } = await firebaseAuth.createUser({
      email,
      emailVerified: true,
      password,
      displayName: `${firstName} ${lastName}`
    })

    await firestore.collection("users").doc(uid).set({
      role
    })

    await firestore.collection("invitations").doc(invitationId).delete()

    res.status(200).json({ message: "User created successfully" })
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
