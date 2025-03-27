import { clsx } from "clsx"

type LoaderProps = {
  enableOverlay?: boolean
  text?: string
  size?: "sm" | "md" | "lg"
}

export const Loader = ({ enableOverlay, text, size = "md" }: LoaderProps) => {
  const loaderClassName = `loader loader-${size}`

  if (enableOverlay || text) {
    const containerClassName = clsx(
      text && "flex flex-col gap-3 items-center",
      enableOverlay && "overlay"
    )

    return (
      <div className={containerClassName}>
        {text && (
          <p className="text-primary dark:text-secondary font-semibold text-2xl">
            {text}
          </p>
        )}
        <div className={loaderClassName} />
      </div>
    )
  }

  return <div className={loaderClassName} />
}
