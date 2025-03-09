type LoaderProps = {
  enableOverlay?: boolean
  text?: string
}

export const Loader = ({ enableOverlay, text }: LoaderProps) => {
  if (enableOverlay || text) {
    const containerTextClassName = text
      ? "flex flex-col gap-3 items-center"
      : ""
    const containerOverlayClassName = enableOverlay ? "overlay" : ""
    const className =
      `${containerTextClassName} ${containerOverlayClassName}`.trim()

    return (
      <div className={className}>
        {text && (
          <p className="text-primary dark:text-secondary font-semibold text-2xl">
            {text}
          </p>
        )}
        <div className="loader" />
      </div>
    )
  }

  return <div className="loader" />
}
