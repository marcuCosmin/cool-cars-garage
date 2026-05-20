import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"

import { getFullCheck } from "@/firebase/firebase.utils"

import { NotFound } from "@/components/core/NotFound"
import { Loader } from "@/components/basic/Loader"
import { ReportsCheck as ReportsCheckCore } from "@/components/core/ReportsCheck/ReportsCheck"

export const ReportsCheck = () => {
  const { checkId } = useParams()
  const { data: check, isLoading } = useQuery({
    queryKey: ["/reports", checkId],
    queryFn: () => getFullCheck(checkId as string)
  })

  if (isLoading) {
    return <Loader enableOverlay />
  }

  if (!check) {
    return <NotFound />
  }

  return <ReportsCheckCore check={check} />
}
