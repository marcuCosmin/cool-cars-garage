import { InputHTMLAttributes } from "react"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error: string
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  const errorInputClassName = `invalid-input ${className}`.trim()
  const inputClassName = error ? errorInputClassName : className

  if (!label) {
    return (
      <div>
        <input className={inputClassName} {...props} />
        {error && <span className="form-error">{error}</span>}
      </div>
    )
  }

  return (
    <label>
      <span>{label}</span>
      <input className={inputClassName} {...props} />
      {error && <span className="form-error">{error}</span>}
    </label>
  )
}
