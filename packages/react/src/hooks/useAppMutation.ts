import { useMutation } from "@tanstack/react-query"

import { showToast } from "@/utils/showToast"

type DefaultMutationFn = (...args: any) => Promise<any | void>

type UseAppMutationProps<T extends DefaultMutationFn> = {
  mutationFn: T
  shouldShowToast?: boolean
}

export const useAppMutation = <T extends DefaultMutationFn>({
  mutationFn,
  shouldShowToast = true
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

      if (response?.message && shouldShowToast) {
        showToast({
          type: "success",
          message: response.message
        })
      }

      return {
        response,
        error: null
      }
    } catch (error) {
      const errorMessage = (error as Error).message

      if (shouldShowToast) {
        showToast({
          type: "error",
          message: errorMessage
        })
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
