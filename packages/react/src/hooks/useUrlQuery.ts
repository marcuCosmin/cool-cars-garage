import { useLocation, useNavigate } from "react-router"

type AddParamArgs = {
  key: string
  value: string
}

export const useUrlQueryParams = () => {
  const naivgate = useNavigate()
  const { search } = useLocation()

  const urlSearchParams = new URLSearchParams(search)

  const updateUrl = () => {
    const search = urlSearchParams.toString()
    naivgate({ search })
  }

  const addParam = ({ key, value }: AddParamArgs) => {
    urlSearchParams.append(key, value)

    updateUrl()
  }
  const removeParam = (key: string) => {
    urlSearchParams.delete(key)
    updateUrl()
  }

  const params = Object.fromEntries(urlSearchParams) as Record<
    string,
    string | undefined
  >

  return { params, addParam, removeParam }
}
