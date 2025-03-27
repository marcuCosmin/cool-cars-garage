import { useEffect } from "react"

import { useReduxDispatch, useReduxSelector } from "../redux/config"
import { setUser, clearUser, setUserMetadata } from "../redux/userSlice"

import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth"
import { firebaseAuth } from "./config"
import { getFirestoreDoc } from "./utils"

import type { UserMetadata } from "../models"

export const useFirebaseAuth = () => {
  const user = useReduxSelector(state => state.userReducer)
  const dispatch = useReduxDispatch()

  useEffect(() => {
    const unsubscribeIdTokenListener = onIdTokenChanged(
      firebaseAuth,
      async user => {
        if (!user) {
          dispatch(clearUser())
          dispatch(setUserMetadata({ loading: false }))
          return
        }

        dispatch(setUserMetadata({ loading: true }))

        const { uid } = user

        const userMetadata = await getFirestoreDoc<UserMetadata>({
          collection: "users",
          document: uid
        })

        dispatch(setUser(user))
        dispatch(
          setUserMetadata({
            loading: false,
            role: userMetadata?.role || "user"
          })
        )
      }
    )

    return unsubscribeIdTokenListener
  }, [])

  return user
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
