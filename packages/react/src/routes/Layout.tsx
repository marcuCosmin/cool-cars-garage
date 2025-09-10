import {
  NavLink,
  Outlet,
  useNavigate,
  type NavLinkRenderProps
} from "react-router"

import { signOutUser } from "@/firebase/utils"

import { useAppSelector } from "@/redux/config"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Loader } from "@/components/basic/Loader"
import { useEffect } from "react"

export const Layout = () => {
  const userRole = useAppSelector(state => state.user.role)
  const navigate = useNavigate()

  const { isLoading, mutate: signOutMutation } = useAppMutation({
    mutationFn: signOutUser
  })

  useEffect(() => {
    if (userRole === "driver") {
      navigate("/reports/auth", { replace: true })
    }
  }, [userRole])

  const onLogoutClick = async () => {
    const { error } = await signOutMutation()

    if (error) {
      return
    }

    navigate("/")
  }

  const navLinkClassName = ({ isActive }: NavLinkRenderProps) =>
    `text-white ${isActive ? "underline" : "no-underline"}`

  return (
    <>
      <nav className="flex justify-between sticky left-0 top-0 p-3 w-full bg-primary font-bold z-[9000]">
        <NavLink className="logo" to="/" end />

        {userRole !== "driver" && (
          <div className="flex gap-5 m-auto">
            <NavLink className={navLinkClassName} to="/" end>
              Home
            </NavLink>
            <NavLink className={navLinkClassName} to="/users" end>
              Users
            </NavLink>
            <NavLink className={navLinkClassName} to="/reports" end>
              Reports
            </NavLink>
          </div>
        )}

        <button
          className="text-white link-button relative"
          type="button"
          onClick={onLogoutClick}
        >
          {isLoading ? <Loader size="sm" /> : "Sign out"}
        </button>
      </nav>

      <main className="relative h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </>
  )
}
