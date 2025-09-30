import { type FirebaseError } from "firebase-admin"

import { firebaseAuth, firestore } from "./config"

import type { CarDoc, UserDoc } from "@/shared/firestore/firestore.model"

export const getUserMetadata = async (uid: string) => {
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
