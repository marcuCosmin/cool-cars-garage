import type { InputHTMLAttributes, ReactNode } from "react"

import { mergeClassNames } from "../../utils/mergeClassNames"

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  adornment?: ReactNode
}

export const Input = ({
  label,
  error,
  className,
  adornment,
  readOnly,
  ...props
}: InputProps) => {
  const containerClassName = mergeClassNames(
    readOnly && "opacity-50",
    !label && "w-full"
  )

  const inputClassName = mergeClassNames(
    error && "invalid-input",
    className,
    adornment && "border-none ring-0"
  )

  const renderedInput = adornment ? (
    <div className="flex items-center gap-2 border rounded-sm pl-2 focus-within:ring-1 focus-within:ring-primary  dark:focus-within:ring-secondary">
      {adornment}
      <input readOnly={readOnly} className={inputClassName} {...props} />
    </div>
  ) : (
    <input readOnly={readOnly} className={inputClassName} {...props} />
  )

  const renderedContent = (
    <>
      {renderedInput}
      {error && <span className="form-error">{error}</span>}
    </>
  )

  if (!label) {
    return <div className={containerClassName}>{renderedContent}</div>
  }

  return (
    <label className={containerClassName}>
      <span>{label}</span>
      {renderedContent}
    </label>
  )
}
