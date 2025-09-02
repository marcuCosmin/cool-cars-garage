import { firebaseAuth, firestore } from "./config"

import type { UserMetadata } from "@/models"

export const getUserMetadata = async (uid: string) => {
  const userRef = firestore.collection("users").doc(uid)
  const userDoc = await userRef.get()

  if (!userDoc.exists) {
    return null
  }

  return userDoc.data() as UserMetadata
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
  await firebaseAuth.deleteUser(uid)
}
