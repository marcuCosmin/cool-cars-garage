type HandleErrorProps = {
  message: string
  shouldForwardToClient?: boolean
  cause?: unknown
}

export const handleError = ({
  message,
  shouldForwardToClient = false,
  cause
}: HandleErrorProps) => {
  throw Object.assign(new Error(message, { cause }), { shouldForwardToClient })
}
