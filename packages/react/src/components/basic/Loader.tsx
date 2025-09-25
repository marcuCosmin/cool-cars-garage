import { mergeClassNames } from "@/utils/mergeClassNames"

type LoaderProps = {
  enableOverlay?: boolean
  text?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export const Loader = ({
  enableOverlay,
  text,
  size = "md",
  className
}: LoaderProps) => {
  const loaderClassName = `loader loader-${size} ${className}`

  if (enableOverlay || text) {
    const containerClassName = mergeClassNames(
      text && "flex flex-col gap-3 items-center",
      enableOverlay && "overlay",
      className
    )

    return (
      <div className={containerClassName}>
        {text && <p className="text-primary font-semibold text-2xl">{text}</p>}
        <div className={loaderClassName} />
      </div>
    )
  }

  return <div className={loaderClassName} />
}
