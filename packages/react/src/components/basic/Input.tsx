import {
  type InputHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
  type MouseEventHandler,
  useState
} from "react"
import { Eye, EyeSlash } from "react-bootstrap-icons"

import type { FormFieldComponentProps } from "@/components/basic/Form/Form.models"

import { mergeClassNames } from "@/utils/mergeClassNames"

export type InputProps = Partial<FormFieldComponentProps<string>> &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "onClick"
  > & {
    onClick?: MouseEventHandler<HTMLDivElement | HTMLInputElement>
    startAdornment?: ReactNode
    endAdornment?: ReactNode
    containerClassName?: string
  }

export const Input = ({
  label,
  error,
  className,
  startAdornment,
  endAdornment,
  containerClassName: additionalContainerClassName,
  value,
  onClick,
  onChange,
  type,
  ...props
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const onPasswordAdornmentClick = () =>
    setIsPasswordVisible(!isPasswordVisible)

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) {
      return
    }

    const newValue = target.value

    onChange(newValue)
  }

  if (type === "password") {
    const iconProps = {
      className: "text-primary",
      height: 20,
      width: 20
    }

    endAdornment = (
      <button
        type="button"
        className="p-0.5 w-fit bg-transparent hover:opacity-75"
        onClick={onPasswordAdornmentClick}
      >
        {isPasswordVisible ? (
          <EyeSlash {...iconProps} />
        ) : (
          <Eye {...iconProps} />
        )}
      </button>
    )
  }

  const containerClassName = mergeClassNames(
    !label && "w-full",
    additionalContainerClassName
  )

  const hasAdornment = !!(startAdornment || endAdornment)

  const defaultInputClassName =
    "w-full p-2 border border-primary rounded-sm h-[40px] max-w-sm outline-none disabled:opacity-50 focus:ring focus:ring-primary focus-within:ring focus-within:ring-primary"

  const inputClassName = mergeClassNames(
    !hasAdornment && defaultInputClassName,
    !hasAdornment && className,
    !hasAdornment && error && "invalid-input",
    hasAdornment &&
      "w-full outline-none border-none p-0 ring-0 cursor-[inherit]"
  )

  const inputType = type === "password" && isPasswordVisible ? "text" : type

  const inputProps = {
    ...props,
    className: inputClassName,
    value,
    type: inputType,
    onChange: handleChange
  }

  const renderedInputOnClick = label && onClick ? onClick : undefined

  const renderedInput = hasAdornment ? (
    <div
      className={mergeClassNames(
        defaultInputClassName,
        "flex items-center cursor-text",
        error && "invalid-input",
        className
      )}
      onClick={renderedInputOnClick}
    >
      {startAdornment}
      <input {...inputProps} />
      {endAdornment}
    </div>
  ) : (
    <input {...inputProps} onClick={renderedInputOnClick} />
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
    <label onClick={e => e.preventDefault()} className={containerClassName}>
      <span>{label}</span>
      {renderedContent}
    </label>
  )
}
