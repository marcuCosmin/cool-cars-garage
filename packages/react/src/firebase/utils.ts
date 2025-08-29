import {
  doc,
  collection,
  getDoc,
  getDocs,
  deleteDoc,
  type DocumentData
} from "firebase/firestore"
import {
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth"
import { firebaseAuth, firestore } from "./config"

import type { SignInFormData } from "@/shared/forms/forms.const"
import type {
  InvitationDoc,
  UserMetadata
} from "@/shared/firestore/firestore.model"

export const signInUser = ({ email, password }: SignInFormData) =>
  signInWithEmailAndPassword(firebaseAuth, email, password)

export type SignInUser = typeof signInUser

export const signInUserAfterCreation = (authToken: string) =>
  signInWithCustomToken(firebaseAuth, authToken)

export const signOutUser = () => signOut(firebaseAuth)

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

export const getUserMetadata = async (uid: string) => {
  const userRef = doc(firestore, "users", uid)
  const userSnapshot = await getDoc(userRef)

  if (!userSnapshot.exists()) {
    throw new Error("User metadata not found")
  }

  const userMetadata = userSnapshot.data() as UserMetadata

  return userMetadata
}

export const getInvitation = async (invitationId: string) => {
  const invitationRef = doc(firestore, "invitations", invitationId)
  const invitationSnapshot = await getDoc(invitationRef)

  if (!invitationSnapshot.exists()) {
    return null
  }

  const invitation = invitationSnapshot.data()

  return invitation as InvitationDoc
}
