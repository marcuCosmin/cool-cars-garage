import { type FirebaseError } from "firebase-admin"

import { firebaseAuth, firestore } from "./config"

import type {
  CarDoc,
  CheckDoc,
  DocWithID,
  PhoneNumberDoc,
  UserDoc
} from "@/shared/firestore/firestore.model"

export const getUserDoc = async (uid: string) => {
  const userRef = firestore.collection("users").doc(uid)
  const userDoc = await userRef.get()

  if (!userDoc.exists) {
    return null
  }

  return userDoc.data() as UserDoc
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

export const getOnRoadPsvCars = async () => {
  const carsRef = firestore.collection("cars")
  const carsQuery = await carsRef
    .where("council", "==", "PSV")
    .where("isOffRoad", "==", false)
    .get()

  if (carsQuery.empty) {
    throw new Error("No PSV on-road cars found")
  }

  return carsQuery.docs.map(doc => {
    const data = doc.data() as CarDoc

    return { id: doc.id, ...data }
  })
}

export const getNotificationPhoneNumbers = async (notificationType: string) => {
  const notificationsConfigRef = firestore
    .collection("phone-numbers")
    .where("notifications", "array-contains", notificationType)
  const notificationsConfigSnapshot = await notificationsConfigRef.get()

  if (notificationsConfigSnapshot.empty) {
    return []
  }

  const phoneNumbers = notificationsConfigSnapshot.docs.map(doc => {
    const data = doc.data() as PhoneNumberDoc

    return data.value
  })

  return phoneNumbers
}

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

export const getChecksFromToday = async () => {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  const startTimestamp = currentDate.getTime()
  currentDate.setHours(23, 59, 59, 999)
  const endTimestamp = currentDate.getTime()

  const checksRef = firestore.collection("checks")
  const checksSnapshot = await checksRef
    .where("creationTimestamp", ">=", startTimestamp)
    .where("creationTimestamp", "<=", endTimestamp)
    .get()

  const checksData = checksSnapshot.docs.map(doc => {
    const data = doc.data() as CheckDoc
    return { id: doc.id, ...data }
  })

  return checksData
}
