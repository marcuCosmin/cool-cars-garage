import { useEffect } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { onIdTokenChanged } from "firebase/auth"
import { firebaseAuth } from "@/firebase/config"
import { signOutUser } from "@/firebase/utils"

import { useAppDispatch, useAppSelector } from "@/redux/config"
import { initUserData } from "@/redux/userSlice"

import { useScreenSizeListener } from "@/hooks/useScreenSize"

import { Router } from "@/routes/Router"

import { ErrorFallback } from "@/components/core/ErrorFallback"
import { Modal } from "@/components/core/Modal/Modal"

import { Loader } from "@/components/basic/Loader"

export const App = () => {
  const userErrorMessage = useAppSelector(state => state.user.error)
  const isUserLoading = useAppSelector(state => state.user.isLoading)
  const dispatch = useAppDispatch()

  const userError = userErrorMessage ? new Error(userErrorMessage) : null
  const resetUserError = () => signOutUser()

  useScreenSizeListener()

  useEffect(() => {
    const unsubscribeIdTokenListener = onIdTokenChanged(firebaseAuth, user =>
      dispatch(initUserData(user))
    )

    return unsubscribeIdTokenListener
  }, [])

  if (userError) {
    return (
      <ErrorFallback error={userError} resetErrorBoundary={resetUserError} />
    )
  }

  if (isUserLoading) {
    return <Loader enableOverlay text="Loading user data" />
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router />
      <Modal />
    </ErrorBoundary>
  )
}
