import { useReduxSelector } from "@/redux/config"

import { CarsList } from "@/components/core/CarsList/CarsList"
import { ReportsAuth } from "@/components/core/ReportsAuth"

export const Home = () => {
  const userRole = useReduxSelector(state => state.userReducer.metadata.role)

  if (userRole === "user") {
    return <ReportsAuth />
  }

  return <CarsList />
}
