import { Suspense, lazy } from "react"

import { BrowserRouter, Route, Routes } from "react-router"

import { useFirebaseAuth } from "./firebase/auth"
import { Loader } from "./components/Loader"

const Home = lazy(() =>
  import("./routes/Home").then(module => ({ default: module.Home }))
)
const Login = lazy(() =>
  import("./routes/Login").then(module => ({ default: module.Login }))
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
  const { uid, role, loading } = useFirebaseAuth()

  const isAdmin = role === "admin"

  if (loading) {
    return <Loader enableOverlay text="Loading user data" />
  }

  return (
    <Suspense fallback={<Loader enableOverlay text="Loading resources" />}>
      <BrowserRouter>
        <Routes>
          {!uid ? (
            <Route index element={<Login />} />
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
  )
}
