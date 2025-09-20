import {
  doc,
  collection,
  getDoc,
  getDocs,
  deleteDoc,
  orderBy,
  startAfter,
  limit,
  query,
  QueryConstraint,
  type DocumentData,
  where
} from "firebase/firestore"
import {
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth"
import { firebaseAuth, firestore } from "./config"

import type {
  FiltersState,
  QueryContext
} from "@/components/core/DataView/DataView.model"

import type { SignInFormData } from "@/shared/forms/forms.const"
import type {
  CheckDoc,
  DocWithID,
  FaultDoc,
  IncidentDoc,
  InvitationDoc,
  UserDoc
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

  const userMetadata = userSnapshot.data() as UserDoc

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

export const getAllUsersDocs = async () => {
  const usersRef = collection(firestore, "users")
  const usersSnapshot = await getDocs(usersRef)

  if (usersSnapshot.empty) {
    return []
  }

  const users = usersSnapshot.docs.map(doc => {
    const data = doc.data() as UserDoc

    return {
      ...data,
      id: doc.id
    }
  })

  return users
}

const getQueryConstraintsFromQueryKey = <Document extends DocumentData>(
  queryKey: QueryContext<Document, true>["queryKey"]
) => {
  const filters = queryKey[2] as FiltersState<Document, true>

  const filtersQueryConstraints: (QueryConstraint | null)[] = filters.map(
    filter => {
      const { type } = filter

      if (type === "select") {
        const { field, value } = filter

        if (value.length === 0) {
          return null
        }

        return where(field as string, "in", value)
      }

      if (type === "toggle") {
        const { filterOptions, value } = filter

        if (!value) {
          return null
        }

        const { field, operator, value: filterValue } = filterOptions

        return where(field as string, operator, filterValue)
      }

      if (type === "date") {
        const { field, value } = filter

        if (!value) {
          return null
        }

        return where(field as string, filter.operator, value)
      }

      return null
    }
  )

  return filtersQueryConstraints.filter(Boolean) as QueryConstraint[]
}

export const getChecksChunk = async ({
  pageParam,
  queryKey
}: QueryContext<CheckDoc, true>): Promise<DocWithID<CheckDoc>[]> => {
  const filtersQueryConstraints = getQueryConstraintsFromQueryKey(queryKey)
  const checksRef = collection(firestore, "checks")

  const queryConstraints = [
    orderBy("creationTimestamp", "desc"),
    ...filtersQueryConstraints,
    pageParam && startAfter(pageParam),
    limit(30)
  ].filter(Boolean) as QueryConstraint[]

  const checksQuery = query(checksRef, ...queryConstraints)

  const checksSnapshot = await getDocs(checksQuery)

  if (checksSnapshot.empty) {
    return []
  }

  const checks = checksSnapshot.docs.map(doc => {
    const data = doc.data() as CheckDoc

    return {
      ...data,
      id: doc.id
    }
  })

  return checks
}

export const getFullCheck = async (checkId: string) => {
  const checkRef = doc(firestore, "checks", checkId)
  const checkSnapshot = await getDoc(checkRef)

  if (!checkSnapshot.exists()) {
    return null
  }

  const check = checkSnapshot.data() as CheckDoc

  const faultsRef = collection(firestore, "faults")
  const faultsQuery = query(faultsRef, where("checkId", "==", checkId))
  const faultsSnapshot = await getDocs(faultsQuery)

  const faults = faultsSnapshot.docs.map(doc => {
    const data = doc.data() as FaultDoc

    return {
      ...data,
      id: doc.id
    }
  })

  const incidentsRef = collection(firestore, "incidents")
  const incidentsQuery = query(incidentsRef, where("checkId", "==", checkId))
  const incidentsSnapshot = await getDocs(incidentsQuery)

  const incidents = incidentsSnapshot.docs.map(doc => {
    const data = doc.data() as IncidentDoc

    return {
      ...data,
      id: doc.id
    }
  })

  return {
    ...check,
    id: checkId,
    faults,
    incidents
  }
}
