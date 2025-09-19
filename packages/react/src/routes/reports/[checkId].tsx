import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"

import { getFullCheck } from "@/firebase/utils"

import { NotFound } from "@/components/core/NotFound"
import { Loader } from "@/components/basic/Loader"

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

  return <div>Check Report</div>
}
