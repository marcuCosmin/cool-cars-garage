import { Suspense, lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router"

import { useFirebaseAuth } from "./firebase/auth"
import { Loader } from "./components/basic/Loader"
import { ErrorBoundary } from "react-error-boundary"

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

export const App = () => {
  const { user, metadata } = useFirebaseAuth()

  const isAdmin = metadata.role === "admin"

  if (metadata.loading) {
    return <Loader enableOverlay text="Loading user data" />
  }

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
              <Route element={<Layout />}>
                <Route index path="/" element={<Home />} />
                {isAdmin && <Route path="/users" element={<Users />} />}
              </Route>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  )
}
