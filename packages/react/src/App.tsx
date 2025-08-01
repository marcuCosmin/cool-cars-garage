import { ErrorBoundary } from "react-error-boundary"

import { useFirebaseAuth } from "@/firebase/auth"

import { useReduxSelector } from "@/redux/config"

import { Router } from "./routes/Router"

import { Modal } from "@/components/core/Modal/Modal"

import { Loader } from "@/components/basic/Loader"

export const App = () => {
  const isUserLoading = useReduxSelector(
    state => state.userReducer.metadata.loading
  )
  useFirebaseAuth()

  if (isUserLoading) {
    return <Loader enableOverlay text="Loading user data" />
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Router />
      <Modal />
    </ErrorBoundary>
  )
}
