import {
  getAuthUser,
  getFirestoreDoc,
  getFirestoreDocs
} from "@/firebase/utils"
import { firebaseAuth, firestore } from "@/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"

import type { Request, Response } from "@/models"

import { userCreateFields, type UserEditData } from "@/shared/forms/forms.const"
import type {
  DocWithID,
  InvitationDoc,
  User,
  UserDoc
} from "@/shared/firestore/firestore.model"
import type { CreateUserResponse } from "@/shared/requests/requests.model"

import { getUserDocData, inviteUser, isEmailUsed } from "./utils"

type UpdateUserEmailProps = Pick<User, "uid" | "email"> & {
  invitation?: DocWithID<InvitationDoc>
}

const updateUserEmail = async ({
  email,
  uid,
  invitation
}: UpdateUserEmailProps) => {
  if (invitation) {
    const invitationRef = firestore.collection("invitations").doc(invitation.id)

    await invitationRef.delete()
    await inviteUser({ ...invitation, email })

    return
  }

  await firebaseAuth.updateUser(uid, {
    email
  })
}

export const handleUserPatchRequest = async (
  req: Request<undefined, CreateUserResponse, UserEditData>,
  res: Response<CreateUserResponse>
) => {
  const { uid, ...data } = req.body
  const { errors, filteredData: validatedPayload } = getFormValidationResult({
    schema: userCreateFields,
    data
  })

  if (errors) {
    res.status(400).json({
      error: "Invalid form data",
      details: errors
    })

    return
  }

  const userDoc = await getFirestoreDoc({
    collection: "users",
    docId: uid
  })

  if (!userDoc) {
    res.status(400).json({ error: "Invalid uid" })
    return
  }

  const { email, ...userPayloadData } = validatedPayload

  let invitation: DocWithID<InvitationDoc> | undefined

  const authUser = await getAuthUser(uid)

  if (authUser?.disabled) {
    res.status(400).json({ error: "User account is disabled" })
    return
  }

  if (!authUser) {
    const [invitationDoc] = await getFirestoreDocs({
      collection: "invitations",
      queries: [["uid", "==", uid]]
    })

    invitation = invitationDoc
  }

  const existingEmail = authUser?.email || invitation?.email

  if (email !== existingEmail) {
    const emailIsUsed = await isEmailUsed(email)

    if (emailIsUsed) {
      res.status(400).json({
        error: "The provided email is already in use"
      })

      return
    }

    await updateUserEmail({ email, uid, invitation })
  }

  if (userDoc.role !== userPayloadData.role) {
    const userDocData = await getUserDocData(userPayloadData)

    await firestore.collection("users").doc(uid).set(userDocData)

    res
      .status(200)
      .json({ user: { ...userDocData, email, uid, isActive: true } })

    return
  }

  if (Object.keys(userPayloadData).length) {
    await firestore.collection("users").doc(uid).update(userPayloadData)
  }

  const userDocData = {
    ...userDoc,
    ...userPayloadData
  } as DocWithID<UserDoc>

  res.status(200).json({
    user: { ...userDocData, email, uid, isActive: true } as User
  })
}
