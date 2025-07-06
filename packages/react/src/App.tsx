import { Suspense, lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { ErrorBoundary } from "react-error-boundary"

import { useFirebaseAuth } from "./firebase/auth"

import { Loader } from "./components/basic/Loader"
import { Modal } from "./components/core/Modal/Modal"

const Home = lazy(() =>
  import("./routes/Home").then(module => ({ default: module.Home }))
)
const SignIn = lazy(() =>
  import("./routes/SignIn").then(module => ({ default: module.SignIn }))
)
const SignUp = lazy(() =>
  import("./routes/SignUp").then(module => ({ default: module.SignUp }))
)
const Users = lazy(() =>
  import("./routes/Users").then(module => ({ default: module.Users }))
)
const Layout = lazy(() =>
  import("./routes/Layout").then(module => ({ default: module.Layout }))
)
const NotFound = lazy(() =>
  import("./routes/NotFound").then(module => ({ default: module.NotFound }))
)
const PhoneVerificationForm = lazy(() =>
  import("./components/core/PhoneVerificationForm/PhoneVerificationForm").then(
    module => ({
      default: module.PhoneVerificationForm
    })
  )
)
const Reports = lazy(() =>
  import("./routes/Reports").then(module => ({
    default: module.Reports
  }))
)

export const App = () => {
  const { user, metadata } = useFirebaseAuth()

  const isAdmin = metadata.role === "admin"
  const displayPhoneVerificationForm = isAdmin && !user.phoneNumber

  if (metadata.loading) {
    return <Loader enableOverlay text="Loading user data" />
  }

  const mainRenderedRoutes = displayPhoneVerificationForm ? (
    <Route index element={<PhoneVerificationForm />} />
  ) : (
    <Route element={<Layout />}>
      <Route index path="/" element={<Home />} />
      {isAdmin && <Route path="/users" element={<Users />} />}
      <Route path="/vehicles-checks" element={<Reports />} />
    </Route>
  )

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<Loader enableOverlay text="Loading resources" />}>
        <BrowserRouter>
          <Routes>
            {!user.uid ? (
              <>
                <Route index element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
              </>
            ) : (
              mainRenderedRoutes
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
      <Modal />
    </ErrorBoundary>
  )
}
