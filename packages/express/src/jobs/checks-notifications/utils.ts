import { firestore } from "@/firebase/config"

import type {
  CarDoc,
  CheckDoc,
  DocWithID,
  NotificationConfigDoc,
  UserDoc
} from "@/shared/firestore/firestore.model"

export const getCarsDriverData = async (cars: DocWithID<CarDoc>[]) => {
  const flattenedDriversIds = cars.map(car => car.driverId).filter(Boolean)
  const driversIdsSet = new Set(flattenedDriversIds)
  const driversIds = Array.from(driversIdsSet)

  const usersRefs = driversIds.map(id => firestore.collection("users").doc(id))

  if (!usersRefs.length) {
    return []
  }

  const usersSnapshots = await firestore.getAll(...usersRefs)

  return usersSnapshots.map(snapshot => {
    const userData = snapshot.data() as UserDoc

    return { id: snapshot.id, ...userData }
  })
}

const getTimestampRanges = () => {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  const startTimestamp = currentDate.getTime()
  currentDate.setHours(23, 59, 59, 999)
  const endTimestamp = currentDate.getTime()

  return { startTimestamp, endTimestamp }
}

export const getChecksInTimestampRange = async () => {
  const { startTimestamp, endTimestamp } = getTimestampRanges()

  const checksRef = firestore.collection("checks")
  const checksSnapshot = await checksRef
    .where("creationTimestamp", ">=", startTimestamp)
    .where("creationTimestamp", "<=", endTimestamp)
    .get()

  const checksData = checksSnapshot.docs.reduce(
    (acc, doc) => {
      const { carId, ...data } = doc.data() as CheckDoc
      acc[carId] = data
      return acc
    },
    {} as Record<string, Omit<CheckDoc, "carId">>
  )

  return checksData
}

export const getReceiversPhoneNumbers = async () => {
  const notifiicationsConfigRef = firestore.collection("notifications-config")
  const notificationsConfigSnapshot = await notifiicationsConfigRef.get()

  if (notificationsConfigSnapshot.empty) {
    throw new Error("Notifications config not found")
  }

  const notificationsConfig = notificationsConfigSnapshot.docs.map(doc => {
    const data = doc.data() as NotificationConfigDoc
    return { phoneNumber: doc.id, ...data }
  })

  const phoneNumbers = notificationsConfig
    .filter(({ checks }) => checks)
    .map(({ phoneNumber }) => phoneNumber)

  return phoneNumbers
}
