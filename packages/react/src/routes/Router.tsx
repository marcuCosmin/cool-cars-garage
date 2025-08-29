import { Suspense, lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router"

import { useAppSelector } from "@/redux/config"

import { Loader } from "@/components/basic/Loader"

const Home = lazy(() =>
  import("./Home").then(module => ({ default: module.Home }))
)
const SignIn = lazy(() =>
  import("./SignIn").then(module => ({ default: module.SignIn }))
)
const SignUp = lazy(() =>
  import("./SignUp").then(module => ({ default: module.SignUp }))
)
const Layout = lazy(() =>
  import("./Layout").then(module => ({ default: module.Layout }))
)
const Reports = lazy(() =>
  import("./Reports/Reports").then(module => ({
    default: module.Reports
  }))
)
const NotFound = lazy(() =>
  import("./NotFound").then(module => ({
    default: module.NotFound
  }))
)

const ReportsAuth = lazy(() =>
  import("./Reports/ReportsAuth").then(module => ({
    default: module.ReportsAuth
  }))
)

export const Router = () => {
  const uid = useAppSelector(state => state.user.uid)
  const userRole = useAppSelector(state => state.user.metadata.role)

  const renderRoleBasedRoutes = () => {
    if (userRole === "driver") {
      return (
        <>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Home />} />
        </>
      )
    }

    if (userRole === "manager") {
      // TODO: Implement manager routes
      return null
    }

    return (
      <>
        <Route path="/">
          <Route index element={<Reports />} />
          <Route path="/auth" element={<ReportsAuth />} />
        </Route>
      </>
    )
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader enableOverlay text="Loading routes" />}>
        <Routes>
          {!uid ? (
            <>
              <Route path="/" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/auth" element={<ReportsAuth />} />
            </>
          ) : (
            <Route element={<Layout />}>{renderRoleBasedRoutes()}</Route>
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
