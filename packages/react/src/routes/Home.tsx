import { useEffect } from "react"
import { useNavigate } from "react-router"

import { useAppSelector } from "@/redux/config"

import { CarsList } from "@/components/core/CarsList/CarsList"
import { Loader } from "@/components/basic/Loader"

export const Home = () => {
  const userRole = useAppSelector(state => state.user.role)
  const navigate = useNavigate()

  useEffect(() => {
    if (userRole === "admin") {
      return
    }

    if (userRole === "manager") {
      navigate("/reports", { replace: true })
      return
    }

    navigate("/reports/auth", { replace: true })
  }, [userRole])

  if (userRole !== "admin") {
    return <Loader enableOverlay />
  }

  return <CarsList />
}
