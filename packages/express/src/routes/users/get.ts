import { type Response } from "express"

import { firebaseAuth, firestore } from "@/firebase/config"

import type { Request } from "@/models"

import type { UserDoc } from "@/shared/firestore/firestore.model"
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
    const { role, firstName, lastName, ...docData } = doc.data() as UserDoc
    const matchingAuthUser = authUsers.find(({ uid }) => uid === doc.id)

    const { metadata, ...remainingDocData } = docData

    const displayName = `${firstName} ${lastName}`

    return {
      title: displayName as string,
      subtitle: role,
      id: doc.id,
      metadata: {
        email: matchingAuthUser?.email,
        phoneNumber: matchingAuthUser?.phoneNumber,
        ...metadata,
        ...remainingDocData
      }
    }
  })

  res.status(200).json({ users })
}
