import {
  doc,
  collection,
  getDoc,
  getDocs,
  deleteDoc,
  type DocumentData
} from "firebase/firestore"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { firebaseAuth, firestore } from "./config"

import { withErrorPropagation } from "@/utils/withErrorPropagation"

import type { UserMetadata } from "@/shared/models"

type SignInUserProps = {
  email: string
  password: string
}

export const signInUser = withErrorPropagation(
  "Firebase - signInUser",
  ({ email, password }: SignInUserProps) =>
    signInWithEmailAndPassword(firebaseAuth, email, password)
)

export type SignInUser = typeof signInUser

export const signOutUser = withErrorPropagation("Firebase - signOutUser", () =>
  signOut(firebaseAuth)
)

type GetFirestoreDocProps = {
  collection: string
  document: string
}

export const getFirestoreDoc = async <T extends DocumentData>({
  collection,
  document
}: GetFirestoreDocProps) => {
  const path = doc(firestore, collection, document)

  const snapshot = await getDoc(path)

  if (!snapshot.exists()) {
    // eslint-disable-next-line no-console
    console.warn(
      `Attempted to get non-existent document: ${document} from collection: ${collection}`
    )

    // this is a react query constraint, we have to return null instead of undefined
    return null
  }

  const data = snapshot.data()

  if (!data) {
    // eslint-disable-next-line no-console
    console.warn(
      `Document ${document} from collection ${collection} exists, but it has no data`
    )

    // this is a react query constraint, we have to return null instead of undefined
    return null
  }

  return data as T
}

type GetFirestoreDocsReturnType<T> = Promise<(T & { id: string })[] | null>

export const getFirestoreDocs = async <T extends DocumentData>(
  collectionId: string
): GetFirestoreDocsReturnType<T> => {
  const path = collection(firestore, collectionId)

  const snapshot = await getDocs(path)

  if (snapshot.empty) {
    // eslint-disable-next-line no-console
    console.warn(
      `Failed to retrieve data from collection: ${collectionId}. The collection is empty`
    )

    // this is a react query constraint, we have to return null instead of undefined
    return null
  }

  const data = snapshot.docs
    .map(doc => {
      const docData = doc.data() as T

      if (!docData) {
        // eslint-disable-next-line no-console
        console.warn(
          `Document ${doc.id} from collection ${collectionId} exists, but it has no data`
        )

        return null
      }

      return {
        ...docData,
        id: doc.id
      }
    })
    .filter(car => car !== null)

  if (!data.length) {
    // eslint-disable-next-line no-console
    console.warn(`Collection ${collectionId} exists, but it has no data`)

    // this is a react query constraint, we have to return null instead of undefined
    return null
  }

  return data
}

type DeleteFirestoreDocProps = {
  collection: string
  document: string
}

export const deleteFirestoreDoc = async ({
  collection,
  document
}: DeleteFirestoreDocProps) => {
  const path = doc(firestore, collection, document)

  await deleteDoc(path)
}

export const getUserMetadata = withErrorPropagation(
  "Firebase - getUserMetadata",
  async (uid: string) => {
    const userRef = doc(firestore, "users", uid)
    const userSnapshot = await getDoc(userRef)

    if (!userSnapshot.exists()) {
      throw new Error("User metadata not found")
    }

    const userMetadata = userSnapshot.data() as UserMetadata

    return userMetadata
  }
)
