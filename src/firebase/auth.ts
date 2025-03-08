import { useEffect } from "react"

import { useReduxDispatch, useReduxSelector } from "../redux/config"
import { setUser, clearUser } from "../redux/userSlice"

import { onIdTokenChanged } from "firebase/auth"
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

        const { uid, phoneNumber, email, emailVerified, displayName } = user

        const { role } = await getFirestoreDoc<User>({
          collection: "users",
          document: uid
        })

        dispatch(
          setUser({ uid, phoneNumber, email, emailVerified, displayName, role })
        )
      }
    )

    return unsubscribeIdTokenListener
  }, [])

  return user
}
