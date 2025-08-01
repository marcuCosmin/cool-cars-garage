import { useActionState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import { toast } from "react-toastify"

import { signOutUser } from "@/firebase/auth"

import { useReduxSelector } from "@/redux/config"

import { Loader } from "@/components/basic/Loader"

export const Layout = () => {
  const userRole = useReduxSelector(state => state.userReducer.metadata.role)
  const navigate = useNavigate()

  const logOutAction = async () => {
    const error = await signOutUser()

    if (!error) {
      navigate("/")
      return
    }

    toast.error(error)
  }

  const [, onSignOutClick, isLoading] = useActionState(logOutAction, undefined)

  return (
    <>
      <nav className="flex justify-between sticky left-0 top-0 p-3 w-full bg-secondary dark:bg-primary font-bold z-[9000]">
        <NavLink className="logo" to="/" end />

        {userRole !== "user" && (
          <div className="flex gap-5 m-auto">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/users" end>
              Users
            </NavLink>
            <NavLink to="/reports" end>
              Reports
            </NavLink>
          </div>
        )}

        <button
          className="link-button font-bold relative"
          type="button"
          onClick={onSignOutClick}
        >
          {isLoading ? <Loader size="sm" /> : "Sign out"}
        </button>
      </nav>

      <main className="h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </>
  )
}
