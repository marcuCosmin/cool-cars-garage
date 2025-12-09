import {
  type CollectionReference,
  type Query,
  type WhereFilterOp
} from "firebase-admin/firestore"
import { type FirebaseError } from "firebase-admin"

import type {
  DocWithID,
  FirestoreCollectionsMap,
  FirestoreCollectionsNames
} from "@/shared/firestore/firestore.model"

import { firebaseAuth, firestore } from "./config"

type GetFirestoreDocProps<T extends FirestoreCollectionsNames> = {
  collection: T
  docId: string
}

export const getFirestoreDoc = async <T extends FirestoreCollectionsNames>({
  collection,
  docId
}: GetFirestoreDocProps<T>) => {
  const docRef = firestore.collection(collection).doc(docId)
  const docSnapshot = await docRef.get()

  if (!docSnapshot.exists) {
    return null
  }

  const data = docSnapshot.data()

  return { id: docSnapshot.id, ...data } as DocWithID<
    FirestoreCollectionsMap[T]
  >
}

type GetFirestoreDocsProps<T extends FirestoreCollectionsNames> =
  | {
      collection: T
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      queries?: [string, WhereFilterOp, any][]
      limit?: number
      orderBy?: { field: string; direction: "asc" | "desc" }
    }
  | {
      collection: T
      ids: string[]
    }

export const getFirestoreDocs = async <T extends FirestoreCollectionsNames>(
  props: GetFirestoreDocsProps<T>
) => {
  if ("ids" in props) {
    const { collection, ids } = props

    if (!ids.length) {
      return [] as DocWithID<FirestoreCollectionsMap[T]>[]
    }

    const docRefs = ids.map(id => firestore.collection(collection).doc(id))
    const docSnapshots = await firestore.getAll(...docRefs)

    const docs = docSnapshots.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DocWithID<FirestoreCollectionsMap[T]>[]

    return docs
  }

  const { collection, queries, limit, orderBy } = props

  let collectionRef: CollectionReference | Query =
    firestore.collection(collection)

  queries?.forEach(([field, operator, value]) => {
    collectionRef = collectionRef.where(field, operator, value)
  })

  if (limit) {
    collectionRef = collectionRef.limit(limit)
  }

  if (orderBy) {
    collectionRef = collectionRef.orderBy(orderBy.field, orderBy.direction)
  }

  const snapshot = await collectionRef.get()

  if (snapshot.empty) {
    return [] as DocWithID<FirestoreCollectionsMap[T]>[]
  }

  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  return data as DocWithID<FirestoreCollectionsMap[T]>[]
}

export const getUserEmail = async (uid: string) => {
  try {
    const [invitation] = await getFirestoreDocs({
      collection: "invitations",
      queries: [["uid", "==", uid]]
    })

    if (invitation) {
      return invitation.email
    }
    const authUser = await firebaseAuth.getUser(uid)

    return authUser.email
  } catch {
    return null
  }
}

export const isEmailUsed = async (email: string) => {
  try {
    await firebaseAuth.getUserByEmail(email)
    const [invitation] = await getFirestoreDocs({
      collection: "invitations",
      queries: [["email", "==", email]]
    })

    return !!invitation
  } catch {
    return false
  }
}

export const getAuthUser = async (uid: string) => {
  try {
    const user = await firebaseAuth.getUser(uid)
    return user
  } catch {
    return null
  }
}

export const deleteUser = async (uid: string) => {
  const userRef = firestore.collection("users").doc(uid)

  await firestore.recursiveDelete(userRef)
  try {
    await firebaseAuth.deleteUser(uid)
  } catch (error) {
    if ((error as FirebaseError).code === "auth/user-not-found") {
      return
    }

    throw error
  }
}

export const getNotificationPhoneNumbers = async (notificationType: string) => {
  const phoneNumbersDocs = await getFirestoreDocs({
    collection: "phone-numbers",
    queries: [["notifications", "array-contains", notificationType]]
  })

  const phoneNumbers = phoneNumbersDocs.map(doc => doc.value)

  return phoneNumbers
}
