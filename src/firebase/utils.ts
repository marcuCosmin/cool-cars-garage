import { doc, getDoc, type DocumentData } from "firebase/firestore"
import { firestore } from "./config"

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
    throw new Error(
      `Attempted to get non-existent document: ${document} from collection: ${collection}`
    )
  }

  const data = snapshot.data()

  if (!data) {
    throw new Error(
      `Document ${document} from collection ${collection} exists, but it has no data`
    )
  }

  return data as T
}
