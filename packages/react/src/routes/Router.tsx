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
const Users = lazy(() =>
  import("./Users").then(module => ({ default: module.Users }))
)
const Layout = lazy(() =>
  import("./Layout").then(module => ({ default: module.Layout }))
)
const UnauthorizedLayout = lazy(() =>
  import("./UnauthorizedLayout").then(module => ({
    default: module.UnauthorizedLayout
  }))
)
const ReportsLayout = lazy(() =>
  import("./reports/Layout").then(module => ({
    default: module.ReportsLayout
  }))
)
const Reports = lazy(() =>
  import("./reports").then(module => ({
    default: module.Reports
  }))
)
const ReportsAuth = lazy(() =>
  import("./reports/auth").then(module => ({
    default: module.ReportsAuth
  }))
)
const ReportsCheckPage = lazy(() =>
  import("./reports/[checkId]").then(module => ({
    default: module.ReportsCheckPage
  }))
)
const NotFound = lazy(() =>
  import("../components/core/NotFound").then(module => ({
    default: module.NotFound
  }))
)
const PrivacyPolicy = lazy(() =>
  import("./privacy-policy").then(module => ({
    default: module.PrivacyPolicy
  }))
)

export const Router = () => {
  const uid = useAppSelector(state => state.user.uid)
  const userRole = useAppSelector(state => state.user.role)

  const renderRoleBasedRoutes = () => {
    if (userRole === "driver") {
      return <Route index path="/reports/auth" element={<ReportsAuth />} />
    }

    if (userRole === "manager") {
      return (
        <>
          <Route index path="/" element={<Home />} />
          <Route path="/reports" element={<ReportsLayout />}>
            <Route index element={<Reports />} />
            <Route path="/reports/:checkId" element={<ReportsCheckPage />} />
          </Route>
        </>
      )
    }

    return (
      <>
        <Route index path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/reports" element={<ReportsLayout />}>
          <Route index element={<Reports />} />
          <Route path="/reports/:checkId" element={<ReportsCheckPage />} />
          <Route path="/reports/auth" element={<ReportsAuth />} />
        </Route>
      </>
    )
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader enableOverlay text="Loading routes" />}>
        <Routes>
          {!uid ? (
            <Route element={<UnauthorizedLayout />}>
              <Route path="/" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          ) : (
            <Route element={<Layout />}>
              {renderRoleBasedRoutes()}
              <Route path="*" element={<NotFound />} />
            </Route>
          )}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
