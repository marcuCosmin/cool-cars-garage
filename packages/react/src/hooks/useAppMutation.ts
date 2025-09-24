import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"

type DefaultMutationFn = (...args: any) => Promise<any | void>

type UseAppMutationProps<T extends DefaultMutationFn> = {
  mutationFn: T
  showToast?: boolean
}

export const useAppMutation = <T extends DefaultMutationFn>({
  mutationFn,
  showToast = true
}: UseAppMutationProps<T>) => {
  const {
    isPending: isLoading,
    error,
    mutateAsync
  } = useMutation<Awaited<ReturnType<T>>>({
    mutationFn
  })

  const mutate = async (...args: Parameters<T>) => {
    try {
      const response = await mutateAsync(...args)

      if (response.message && showToast) {
        toast.success(response.message)
      }

      return {
        response,
        error: null
      }
    } catch (error) {
      const errorMessage = (error as Error).message

      if (showToast) {
        toast.error(errorMessage)
      }

      return {
        data: null,
        error: errorMessage
      }
    }
  }

  return {
    isLoading,
    error: error?.message || null,
    mutate
  }
}
