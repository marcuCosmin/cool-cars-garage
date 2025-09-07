import { useAppSelector } from "@/redux/config"

import { CarsList } from "@/components/core/CarsList/CarsList"
import { ReportsAuth } from "@/components/core/ReportsAuth"

export const Home = () => {
  const userRole = useAppSelector(state => state.user.role)

  if (userRole === "driver") {
    return <ReportsAuth />
  }

  return <CarsList />
}
