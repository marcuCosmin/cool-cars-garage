export const withErrorPropagation =
  <T extends (...args: any[]) => Promise<unknown>>(
    requestId: string,
    request: T
  ) =>
  async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      const data = await request(...args)

      return data as Awaited<ReturnType<T>>
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`${requestId}: ${error.message}`)
      }

      throw new Error(`${requestId}: An unknown error occurred`)
    }
  }
