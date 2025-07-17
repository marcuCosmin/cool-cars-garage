import { Timestamp } from "firebase-admin/firestore"

export const getCurrentTimestamp = () => {
  const currentTime = new Date().getTime()

  const timestamp = new Timestamp(currentTime / 1000, 0)

  return timestamp
}
