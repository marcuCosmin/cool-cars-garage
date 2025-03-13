import { useActionState } from "react"
import { NavLink, Outlet } from "react-router"

import { signOutUser } from "../firebase/auth"
import { Loader } from "../components/Loader"

const logOutAction = async () => {
  const error = await signOutUser()

  if (error) {
    return error
  }
}

export const Layout = () => {
  //TODO: Do something with the error
  const [logOutError, onSignOutClick, isLoading] = useActionState(
    logOutAction,
    null
  )

  return (
    <>
      <nav className="flex justify-between sticky left-0 top-0 p-3 w-full bg-secondary dark:bg-primary font-bold">
        <NavLink className="logo" to="/" end />

        <div className="flex gap-5 m-auto">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/users" end>
            Users
          </NavLink>
        </div>

        <button
          className="link-button font-bold relative"
          type="button"
          onClick={onSignOutClick}
        >
          {isLoading ? <Loader size="sm" /> : "Sign out"}
        </button>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  )
}
