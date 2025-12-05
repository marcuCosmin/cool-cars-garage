import { type Response } from "express"

import { firebaseAuth, firestore } from "@/firebase/config"

import type { Request } from "@/models"

import type {
  DocWithID,
  ExistingUserInvitation,
  InvitationDoc,
  NewUserInvitation,
  UserDoc
} from "@/shared/firestore/firestore.model"
import type { RawUserListItem } from "@/shared/dataLists/dataLists.model"

export const handleGetRequest = async (req: Request, res: Response) => {
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

  const userDocs = await firestore
    .collection("users")
    .where("__name__", "!=", uid)
    .get()

  if (userDocs.empty) {
    res.status(404).json({
      users: [],
      error: "Users metadata not found"
    })

    return
  }

  const invitationsSnapshot = await firestore.collection("invitations").get()

  const { existingUsersInvitations, newUsersInvitations } =
    invitationsSnapshot.docs.reduce(
      (acc, doc) => {
        const data = doc.data() as InvitationDoc

        if ((data as ExistingUserInvitation).uid) {
          acc.existingUsersInvitations.push({
            id: doc.id,
            ...data
          } as DocWithID<ExistingUserInvitation>)

          return acc
        }

        acc.newUsersInvitations.push({
          id: doc.id,
          ...data
        } as DocWithID<NewUserInvitation>)

        return acc
      },
      {
        existingUsersInvitations: [] as DocWithID<ExistingUserInvitation>[],
        newUsersInvitations: [] as DocWithID<NewUserInvitation>[]
      }
    )

  const users: RawUserListItem[] = userDocs.docs.map(doc => {
    const docData = doc.data() as UserDoc
    const { firstName, lastName, role, metadata, ...remainingDocData } =
      docData as Extract<UserDoc, { role: "driver" }>
    const matchingAuthUser = authUsers.find(({ uid }) => uid === doc.id)

    const invitationIndex = existingUsersInvitations.findIndex(
      inv => inv.uid === doc.id
    )

    const invitation =
      invitationIndex !== -1 ? existingUsersInvitations[invitationIndex] : null

    const title = `${firstName} ${lastName}`

    return {
      title,
      subtitle: role,
      id: doc.id,
      metadata: {
        email: matchingAuthUser?.email || invitation?.email,
        phoneNumber: matchingAuthUser?.phoneNumber,
        ...metadata,
        ...remainingDocData
      }
    }
  })

  const invitationsItems: RawUserListItem[] = newUsersInvitations.map(
    invitation => {
      const {
        firstName,
        lastName,
        role,
        metadata,
        id,
        ...remainingInvitationData
      } = invitation as Extract<
        DocWithID<NewUserInvitation>,
        { role: "driver" }
      >
      const title = `${firstName} ${lastName}`

      console.log(metadata, remainingInvitationData)

      return {
        title,
        subtitle: role,
        id,
        metadata: {
          ...metadata,
          ...remainingInvitationData,
          invitationPending: true
        }
      }
    }
  )

  const usersList = [...users, ...invitationsItems].sort(
    (a, b) => a.metadata.creationTimestamp - b.metadata.creationTimestamp
  )

  res.status(200).json({ usersList })
}
