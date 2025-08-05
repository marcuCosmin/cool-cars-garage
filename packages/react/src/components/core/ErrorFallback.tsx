import type { FallbackProps } from "react-error-boundary"

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const isBasicError = error instanceof Error
  return (
    <div className="flex flex-col items-center h-full m-auto gap-4 mt-10 max-w-xl">
      <h1>Something went wrong</h1>
      {isBasicError ? (
        <>
          <p>{error.message}</p>
          <p>{error.stack || "No stack trace available."}</p>
        </>
      ) : (
        <p>
          An unexpected error occured. Please check the console for more
          details.
        </p>
      )}
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  )
}
