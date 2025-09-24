import { type FirebaseError } from "firebase-admin"

import { firebaseAuth, firestore } from "./config"

import type { UserDoc } from "@/shared/firestore/firestore.model"

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
