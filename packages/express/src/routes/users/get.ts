import { type Response } from "express"

import { UserRecord } from "firebase-admin/auth"
import { firebaseAuth, firestore } from "@/firebase/config"

import type { Request } from "@/models"

import type { UserMetadata } from "@/shared/firestore/firestore.model"
import type { RawUserListItem } from "@/shared/dataLists/dataLists.model"

export const handleGetRequest = async (req: Request, res: Response) => {
  const uid = req.uid as string

  const { users: authUsers } = await firebaseAuth.listUsers()

  const filteredAuthUsers = authUsers.filter(user => user.uid !== uid)

  if (!filteredAuthUsers.length) {
    res.status(200).json({
      users: [],
      error: "No users found"
    })

    return
  }

  const usersMetadata = await firestore
    .collection("users")
    .where("__name__", "!=", uid)
    .get()

  if (usersMetadata.empty) {
    res.status(404).json({
      users: [],
      error: "Users metadata not found"
    })

    return
  }

  const users: RawUserListItem[] = usersMetadata.docs.map(doc => {
    const { role, ...metadata } = doc.data() as UserMetadata
    const matchingAuthUser = authUsers.find(
      ({ uid }) => uid === doc.id
    ) as UserRecord

    const {
      uid,
      email,
      displayName,
      phoneNumber,
      metadata: authMetadata
    } = matchingAuthUser

    const creationDate = new Date(authMetadata.creationTime)
    const creationTimestamp = creationDate.getTime()

    return {
      title: displayName as string,
      subtitle: role,
      id: uid,
      metadata: {
        email: email as string,
        phoneNumber,
        creationTimestamp,
        ...metadata
      }
    }
  })

  res.status(200).json({ users })
}
