import { NavLink, Outlet, useNavigate } from "react-router"

import { signOutUser } from "@/firebase/utils"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Loader } from "@/components/basic/Loader"

export const Layout = () => {
  const navigate = useNavigate()

  const { isLoading, mutate: signOutMutation } = useAppMutation({
    mutationFn: signOutUser
  })

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
