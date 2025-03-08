import { Suspense, lazy } from "react"

import { BrowserRouter, Route, Routes } from "react-router"

import { useFirebaseAuth } from "./firebase/auth"

const Home = lazy(() =>
  import("./routes/Home").then(module => ({ default: module.Home }))
)
const Login = lazy(() =>
  import("./routes/Login").then(module => ({ default: module.Login }))
)
const Layout = lazy(() =>
  import("./routes/Layout").then(module => ({ default: module.Layout }))
)
const NotFound = lazy(() =>
  import("./routes/NotFound").then(module => ({ default: module.NotFound }))
)

export const App = () => {
  const { uid } = useFirebaseAuth()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <Routes>
          {!uid ? (
            <Route index element={<Login />} />
          ) : (
            <Route element={<Layout />}>
              <Route index path="/" element={<Home />} />
            </Route>
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  )
}
