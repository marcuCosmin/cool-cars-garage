import { useLocation } from "react-router"

type UseUrlQueryParams = () => Record<string, string | undefined>

export const useUrlQueryParams: UseUrlQueryParams = () => {
  const { search } = useLocation()

  const urlSearchParams = new URLSearchParams(search)

  const urlQueryParams = Object.fromEntries(urlSearchParams)

  return urlQueryParams
}
