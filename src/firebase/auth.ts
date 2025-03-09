import { useEffect } from "react"

import { useReduxDispatch, useReduxSelector } from "../redux/config"
import { setUser, clearUser, setUserLoading } from "../redux/userSlice"

import { onIdTokenChanged, signInWithEmailAndPassword } from "firebase/auth"
import { firebaseAuth } from "./config"
import { getFirestoreDoc } from "./utils"

import type { User } from "../models"

export const useFirebaseAuth = () => {
  const user = useReduxSelector(state => state.userReducer)
  const dispatch = useReduxDispatch()

  useEffect(() => {
    const unsubscribeIdTokenListener = onIdTokenChanged(
      firebaseAuth,
      async user => {
        if (!user) {
          dispatch(clearUser())
          return
        }

        dispatch(setUserLoading(true))

        const { uid, phoneNumber, email, emailVerified, displayName } = user

        const { role } = await getFirestoreDoc<User>({
          collection: "users",
          document: uid
        })

        dispatch(
          setUser({ uid, phoneNumber, email, emailVerified, displayName, role })
        )
        dispatch(setUserLoading(false))
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
