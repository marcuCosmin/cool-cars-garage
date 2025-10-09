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
  where,
  Query,
  CollectionReference,
  type DocumentData,
  type WhereFilterOp
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
  FaultDoc,
  FullCheck,
  IncidentDoc,
  UserDoc
} from "@/shared/firestore/firestore.model"

export const signInUser = ({ email, password }: SignInFormData) =>
  signInWithEmailAndPassword(firebaseAuth, email, password)

export type SignInUser = typeof signInUser

export const signInUserAfterCreation = (authToken: string) =>
  signInWithCustomToken(firebaseAuth, authToken)

export const signOutUser = () => signOut(firebaseAuth)

type GetFirestoreDocProps = {
  collectionId: string
  docId: string
}

export const getFirestoreDoc = async <T extends DocumentData>({
  collectionId,
  docId
}: GetFirestoreDocProps) => {
  const docRef = doc(firestore, collectionId, docId)
  const docSnapshot = await getDoc(docRef)

  if (!docSnapshot.exists()) {
    return null
  }

  const data = docSnapshot.data() as T

  return {
    ...data,
    id: docSnapshot.id
  }
}

type FirestoreFilter = [string, WhereFilterOp, unknown]

type GetFirestoreDocsProps = {
  collectionId: string
  filters?: FirestoreFilter[]
  cap?: number
  order?: { field: string; direction: "asc" | "desc" }
  lastRefValue?: any
}

export const getFirestoreDocs = async <T extends DocumentData>({
  collectionId,
  filters,
  cap,
  order,
  lastRefValue
}: GetFirestoreDocsProps) => {
  let path: CollectionReference<DocumentData> | Query<DocumentData> =
    collection(firestore, collectionId)

  const queryFiltersConstraints: QueryConstraint[] = (filters || []).map(
    ([field, operator, value]) => where(field, operator, value)
  )

  const queryConstraints: QueryConstraint[] = [
    ...queryFiltersConstraints,
    cap && limit(cap),
    order && orderBy(order.field, order.direction),
    lastRefValue && startAfter(lastRefValue)
  ].filter(Boolean) as QueryConstraint[]

  if (queryConstraints.length) {
    path = query(path, ...queryConstraints)
  }

  const snapshot = await getDocs(path)

  if (snapshot.empty) {
    return []
  }

  const data = snapshot.docs.map(doc => {
    const docData = doc.data() as T

    return {
      ...docData,
      id: doc.id
    }
  })

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

const getFirestoreFiltersFromQueryKey = <Document extends DocumentData>(
  queryKey: QueryContext<Document, true>["queryKey"]
) => {
  const filters = queryKey[2] as FiltersState<Document, true>

  const filtersQueryConstraints: (FirestoreFilter | null)[] = filters.map(
    filter => {
      const { type } = filter

      if (type === "select") {
        const { field, value } = filter

        if (value.length === 0) {
          return null
        }

        return [field as string, "in", value]
      }

      if (type === "toggle") {
        const { filterOptions, value } = filter

        if (!value) {
          return null
        }

        const { field, operator, value: filterValue } = filterOptions

        return [field as string, operator, filterValue]
      }

      if (type === "date") {
        const { field, value } = filter

        if (!value) {
          return null
        }

        return [field as string, filter.operator, value]
      }

      return null
    }
  )

  return filtersQueryConstraints.filter(Boolean) as FirestoreFilter[]
}

type GetFirestoreCollectionChunksProps<T extends DocumentData> = {
  collectionId: string
  queryContext: QueryContext<T, true>
}

export const getFirestoreCollectionChunks = async <T extends DocumentData>({
  collectionId,
  queryContext
}: GetFirestoreCollectionChunksProps<T>) => {
  const filters = getFirestoreFiltersFromQueryKey(queryContext.queryKey)

  const data = await getFirestoreDocs<T>({
    collectionId,
    filters,
    cap: 30,
    order: { field: "creationTimestamp", direction: "desc" },
    lastRefValue: queryContext.pageParam
  })

  return data
}

export const getFullCheck = async (
  checkId: string
): Promise<FullCheck | null> => {
  const checkData = await getFirestoreDoc<CheckDoc>({
    collectionId: "checks",
    docId: checkId
  })

  if (!checkData) {
    return null
  }

  const { driverId, ...check } = checkData

  const user = await getFirestoreDoc<UserDoc>({
    collectionId: "users",
    docId: driverId
  })

  const faults = await getFirestoreDocs<FaultDoc>({
    collectionId: "faults",
    filters: [["checkId", "==", checkId]]
  })

  const incidents = await getFirestoreDocs<IncidentDoc>({
    collectionId: "incidents",
    filters: [["checkId", "==", checkId]]
  })

  return {
    ...check,
    driver: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      id: driverId
    },
    id: checkId,
    faults,
    incidents
  }
}
