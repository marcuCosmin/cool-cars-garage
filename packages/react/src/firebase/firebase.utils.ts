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
  where,
  updateDoc,
  type QueryConstraint,
  type Query,
  type CollectionReference,
  type DocumentReference,
  type DocumentData,
  type UpdateData
} from "firebase/firestore"
import {
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth"
import { firebaseAuth, firestore } from "./firebase.config"

import type {
  FiltersState,
  QueryContext
} from "@/components/core/DataView/DataView.model"

import type { SignInFormData } from "@/globals/forms/forms.const"
import type {
  CollectionsWithCreationTimestamp,
  DocWithID,
  FirestoreCollectionsMap,
  FirestoreCollectionsNames,
  FullCheck
} from "@/globals/firestore/firestore.model"
import type {
  SearchPayloads,
  SearchFilter,
  SearchPayload
} from "@/globals/requests/requests.model"

export const signInUser = ({ email, password }: SignInFormData) =>
  signInWithEmailAndPassword(firebaseAuth, email, password)

export type SignInUser = typeof signInUser

export const signInUserAfterCreation = (authToken: string) =>
  signInWithCustomToken(firebaseAuth, authToken)

export const signOutUser = () => signOut(firebaseAuth)

type GetFirestoreDocProps<T extends FirestoreCollectionsNames> = {
  collectionId: T
  docId: string
}

export const getFirestoreDoc = async <T extends FirestoreCollectionsNames>({
  collectionId,
  docId
}: GetFirestoreDocProps<T>) => {
  const docRef = doc(firestore, collectionId, docId)
  const docSnapshot = await getDoc(docRef)

  if (!docSnapshot.exists()) {
    return null
  }

  const data = docSnapshot.data() as FirestoreCollectionsMap[T]

  return {
    ...data,
    id: docSnapshot.id
  }
}

type GetFirestoreDocsProps<T extends FirestoreCollectionsNames> =
  SearchPayload<T> & {
    lastRefValue?: any
  }

export function getFirestoreDocs<T extends FirestoreCollectionsNames>(
  props: GetFirestoreDocsProps<T>
): Promise<DocWithID<FirestoreCollectionsMap[T]>[]>
export function getFirestoreDocs(
  props: SearchPayloads & { lastRefValue?: any }
): Promise<DocWithID<FirestoreCollectionsMap[FirestoreCollectionsNames]>[]>
export async function getFirestoreDocs<T extends FirestoreCollectionsNames>({
  collectionId,
  filters,
  cap,
  order,
  lastRefValue
}: GetFirestoreDocsProps<T>) {
  let path: CollectionReference<DocumentData> | Query<DocumentData> =
    collection(firestore, collectionId)

  const queryFiltersConstraints = (filters || []).map(
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
    const docData = doc.data() as FirestoreCollectionsMap[T]

    return {
      ...docData,
      id: doc.id
    } as DocWithID<FirestoreCollectionsMap[T]>
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

const getFirestoreFiltersFromQueryKey = <
  Document extends FirestoreCollectionsMap[FirestoreCollectionsNames]
>(
  queryKey: QueryContext<Document, true>["queryKey"]
): SearchFilter<Document>[] => {
  const filters = queryKey[2] as FiltersState<Document, true>

  const filtersQueryConstraints = filters.map(filter => {
    const { type } = filter

    if (type === "select") {
      const { field, value } = filter

      if (value.length === 0) {
        return null
      }

      return [field, "in", value]
    }

    if (type === "toggle") {
      const { filterOptions, value } = filter

      if (!value) {
        return null
      }

      const { field, operator, value: filterValue } = filterOptions

      return [field, operator, filterValue]
    }

    if (type === "date") {
      const { field, value } = filter

      if (!value) {
        return null
      }

      return [field, filter.operator, value]
    }

    return null
  })

  // `field`/`value` are erased to runtime strings here, so the tuples can't be
  // matched against a specific `SearchFilter` member — cast once at the boundary.
  return filtersQueryConstraints.filter(
    (filter): filter is NonNullable<typeof filter> => filter !== null
  ) as SearchFilter<Document>[]
}

type UpdateFirestoreDocProps<T extends DocumentData> = {
  collectionId: string
  docId: string
  data: UpdateData<T>
}

export const updateFirestoreDoc = async <T extends DocumentData>({
  collectionId,
  docId,
  data
}: UpdateFirestoreDocProps<T>) => {
  const docRef = doc(firestore, collectionId, docId) as DocumentReference<
    DocumentData,
    T
  >

  await updateDoc(docRef, data)
}

type GetFirestoreCollectionChunksProps<
  T extends CollectionsWithCreationTimestamp
> = {
  collectionId: T
  queryContext: QueryContext<FirestoreCollectionsMap[T], true>
}

export const getFirestoreCollectionChunks = async <
  T extends CollectionsWithCreationTimestamp
>({
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
  const checkData = await getFirestoreDoc({
    collectionId: "checks",
    docId: checkId
  })

  if (!checkData) {
    return null
  }

  const { driverId, ...check } = checkData

  const user = await getFirestoreDoc({
    collectionId: "users",
    docId: driverId
  })

  const faults = await getFirestoreDocs({
    collectionId: "faults",
    filters: [["checkId", "==", checkId]]
  })

  const incidents = await getFirestoreDocs({
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
