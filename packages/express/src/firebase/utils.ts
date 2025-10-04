import {
  CollectionReference,
  Query,
  type WhereFilterOp
} from "firebase-admin/firestore"
import { type FirebaseError } from "firebase-admin"

import { firebaseAuth, firestore } from "./config"

import type {
  DocWithID,
  PhoneNumberDoc
} from "@/shared/firestore/firestore.model"

type GetFirestoreDocProps = {
  collection: string
  docId: string
}

export const getFirestoreDoc = async <T>({
  collection,
  docId
}: GetFirestoreDocProps) => {
  const docRef = firestore.collection(collection).doc(docId)
  const docSnapshot = await docRef.get()

  if (!docSnapshot.exists) {
    return null
  }

  return docSnapshot.data() as T
}

type GetFirestoreDocsProps =
  | {
      collection: string
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      queries?: [string, WhereFilterOp, any][]
      limit?: number
      orderBy?: { field: string; direction: "asc" | "desc" }
    }
  | {
      collection: string
      ids: string[]
    }

export const getFirestoreDocs = async <T>(props: GetFirestoreDocsProps) => {
  if ("ids" in props) {
    const { collection, ids } = props

    if (!ids.length) {
      return [] as DocWithID<T>[]
    }

    const docRefs = ids.map(id => firestore.collection(collection).doc(id))
    const docSnapshots = await firestore.getAll(...docRefs)

    const docs = docSnapshots.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DocWithID<T>[]

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
    return [] as DocWithID<T>[]
  }

  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  return data as DocWithID<T>[]
}

export const isEmailUsed = async (email: string) => {
  try {
    await firebaseAuth.getUserByEmail(email)
    return true
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
  const phoneNumbersDocs = await getFirestoreDocs<PhoneNumberDoc>({
    collection: "phone-numbers",
    queries: [["notifications", "array-contains", notificationType]]
  })

  const phoneNumbers = phoneNumbersDocs.map(doc => doc.value)

  return phoneNumbers
}
