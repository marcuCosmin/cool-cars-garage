import { useEffect } from "react"

import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth"
import { firebaseAuth } from "./config"

import { useReduxDispatch } from "@/redux/config"
import { setUser, clearUser, fetchUserMetadata } from "@/redux/userSlice"

export const useFirebaseAuth = () => {
  const dispatch = useReduxDispatch()

  useEffect(() => {
    const unsubscribeIdTokenListener = onIdTokenChanged(
      firebaseAuth,
      async user => {
        if (!user) {
          dispatch(clearUser())
          return
        }

        const { uid } = user

        await dispatch(fetchUserMetadata(uid))
        dispatch(setUser(user))
      }
    )

    return unsubscribeIdTokenListener
  }, [])
}

type SignInUserProps = {
  email: string
  password: string
}

export const signInUser = async ({ email, password }: SignInUserProps) => {
  try {
    await signInWithEmailAndPassword(firebaseAuth, email, password)
  } catch (error: unknown) {
    if (error instanceof Error) {
      // TODO: More descriptive error messages with a switch case
      return error.message
    }

    return "An unknown error occurred"
  }
}

export const signOutUser = async () => {
  try {
    await signOut(firebaseAuth)
  } catch (error) {
    if (error instanceof Error) {
      // TODO: More descriptive error messages with a switch case
      return error.message
    }

    return "An unknown error occurred"
  }
}
