import { firebaseAuth } from "@/firebase/config"
import { getFirestoreDocs } from "@/firebase/utils"

import type { Request, Response } from "@/models"

import type { GetUsersResponse } from "@/globals/requests/requests.model"
import type { InvitationDoc, User } from "@/globals/firestore/firestore.model"

export const handleGetRequest = async (
  req: Request,
  res: Response<GetUsersResponse>
) => {
  const uid = req.authorizedUser?.uid as string

  const { users: authUsers } = await firebaseAuth.listUsers()

  const filteredAuthUsers = authUsers.filter(user => user.uid !== uid)

  if (!filteredAuthUsers.length) {
    res.status(200).json({
      users: [],
      error: "No users found"
    })

    return
  }

  const usersDocs = await getFirestoreDocs({
    collection: "users",
    queries: [["__name__", "!=", uid]]
  })

  if (!usersDocs.length) {
    res.status(404).json({
      users: [],
      error: "Users metadata not found"
    })

    return
  }

  const pendingInvitationUsers = usersDocs.filter(
    ({ id }) => !filteredAuthUsers.some(({ uid }) => uid === id)
  )
  const pendingInvitationsUsersIds = pendingInvitationUsers.map(({ id }) => id)

  let invitations: InvitationDoc[] = []

  if (pendingInvitationsUsersIds.length) {
    invitations = await getFirestoreDocs({
      collection: "invitations",
      queries: [["uid", "in", pendingInvitationsUsersIds]]
    })
  }

  const users: User[] = usersDocs.map(({ id, ...userDoc }) => {
    const authData = authUsers.find(({ uid }) => uid === id)
    const inivitationData = invitations.find(({ uid }) => uid === id)

    const user: User = {
      ...userDoc,
      uid: id,
      isActive: authData ? !authData.disabled : !!inivitationData?.isActive,
      email: authData?.email || inivitationData?.email || ""
    }

    if (inivitationData) {
      user.invitationPending = true
    }

    return user
  })

  res.status(200).json({ users })
}
