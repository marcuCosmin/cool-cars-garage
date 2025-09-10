import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"

const availableRoutes = ["/", "/sign-up"]

export const UnauthorizedLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const isRouteAvailable = availableRoutes.includes(location.pathname)

  useEffect(() => {
    if (isRouteAvailable) {
      return
    }

    navigate("/")
  }, [isRouteAvailable])

  if (isRouteAvailable) {
    return <Outlet />
  }

  return null
}
