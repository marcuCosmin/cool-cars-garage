type HandleErrorProps = {
  message?: string
  shouldForwardToClient?: boolean
  cause?: unknown
}

export const handleError = ({
  message,
  shouldForwardToClient = false,
  cause
}: HandleErrorProps) => {
  if (!message) {
    throw cause
  }

  throw Object.assign(new Error(message, { cause }), { shouldForwardToClient })
}
