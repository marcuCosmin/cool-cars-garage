import { useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"

import { signOutUser } from "@/firebase/firebase.utils"

import { useAppSelector } from "@/redux/redux.config"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Loader } from "@/components/basic/Loader"
import { Dropdown } from "@/components/basic/Dropdown"

import { MainLayoutNavLink } from "./MainLayoutNavLink"

import { navLinks } from "./MainLayout.const"

export const MainLayout = () => {
  const userRole = useAppSelector(({ user }) => user.role)
  const userName = useAppSelector(
    ({ user }) => `${user.firstName} ${user.lastName}`
  )
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

  return (
    <>
      <nav className="flex justify-between sticky left-0 top-0 p-3 w-full bg-primary font-bold z-[9000]">
        <NavLink className="logo" to="/" end />

        {userRole === "admin" && (
          <div className="flex gap-5 m-auto">
            {navLinks.map((link, index) => (
              <MainLayoutNavLink key={index} {...link} />
            ))}
          </div>
        )}

        <Dropdown title={userName} buttonClassName="text-white link-button">
          <button type="button" className="link-button" onClick={onLogoutClick}>
            {isLoading ? <Loader size="sm" /> : "Sign out"}
          </button>
        </Dropdown>
      </nav>

      <main className="flex flex-col relative h-[calc(100vh-64px)] overflow-auto">
        <Outlet />
      </main>
    </>
  )
}
