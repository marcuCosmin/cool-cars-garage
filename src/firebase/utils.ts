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
