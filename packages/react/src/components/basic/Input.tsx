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

type InputBaseProps = Partial<FormFieldComponentProps<string>> &
  Pick<InputHTMLAttributes<HTMLInputElement>, "className" | "disabled"> & {
    onClick?: MouseEventHandler<HTMLDivElement | HTMLInputElement>
    startAdornment?: ReactNode
    endAdornment?: ReactNode
    containerClassName?: string
  }

export type InputProps =
  | (InputBaseProps & {
      type?: InputHTMLAttributes<HTMLInputElement>["type"]
    })
  | (InputBaseProps & {
      type: "textarea"
      rows?: number
    })

export const Input = (props: InputProps) => {
  const {
    label,
    error,
    className,
    startAdornment,
    containerClassName: additionalContainerClassName,
    value,
    onClick,
    onChange,
    type,
    onBlur,
    disabled
  } = props

  let { endAdornment } = props

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const onPasswordAdornmentClick = () =>
    setIsPasswordVisible(!isPasswordVisible)

  const handleChange = ({
    target
  }: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
    if (!onChange) {
      return
    }

    const newValue = target.value

    onChange(newValue)
  }

  if (type === "password") {
    const iconProps = {
      className: error ? "text-error" : "text-primary",
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

  const inputClassName = mergeClassNames(
    error && "invalid-input",
    "w-full outline-none border-none p-0 ring-0 cursor-[inherit]",
    className
  )
  const inputType = type === "password" && isPasswordVisible ? "text" : type

  const renderedInputOnClick = label && onClick ? onClick : undefined

  const rows = ("rows" in props ? props.rows : undefined) ?? 3

  return (
    <label
      onClick={e => e.preventDefault()}
      className={mergeClassNames(
        !label && "w-full max-w-sm",
        disabled && "opacity-50 dark:opacity-70",
        additionalContainerClassName
      )}
    >
      {label && <span>{label}</span>}

      <div
        className={mergeClassNames(
          "w-full p-2 border border-primary rounded-sm h-[40px] outline-none focus:ring focus:ring-primary focus-within:ring focus-within:ring-primary",
          "flex items-center cursor-text h-fit",
          error && "invalid-input",
          className
        )}
        onClick={renderedInputOnClick}
      >
        {startAdornment}
        {type === "textarea" ? (
          <textarea
            className={inputClassName}
            rows={rows}
            value={value}
            onBlur={onBlur}
            onChange={handleChange}
            disabled={disabled}
          />
        ) : (
          <input
            className={inputClassName}
            type={inputType}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
          />
        )}
        {endAdornment}
      </div>

      {error && <span className="form-error">{error}</span>}
    </label>
  )
}
