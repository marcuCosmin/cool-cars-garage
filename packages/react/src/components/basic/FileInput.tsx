import {
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type MouseEvent
} from "react"
import { Paperclip, XCircleFill } from "react-bootstrap-icons"

import type { FormFieldComponentProps } from "@/components/basic/Form/Form.models"

import { mergeClassNames } from "@/utils/mergeClassNames"

import { Loader } from "./Loader"

export type FileInputProps = Omit<
  Partial<FormFieldComponentProps<string>>,
  "onChange"
> & {
  onChange: (file: File | undefined) => void
  isLoading?: boolean
  accept?: string
  containerClassName?: string
}

export const FileInput = ({
  label,
  value,
  isLoading,
  onChange,
  accept,
  error,
  containerClassName,
  onBlur
}: FileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0]

    setSelectedFile(file ?? null)
    onChange(file)
  }

  const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (inputRef.current) {
      inputRef.current.value = ""
    }

    setSelectedFile(null)
    onChange(undefined)
  }

  const handleBlur = ({
    currentTarget,
    relatedTarget
  }: FocusEvent<HTMLDivElement>) => {
    if (!relatedTarget) {
      return
    }

    const isInternalFocus = currentTarget.contains(relatedTarget)
    const isAncestorFocus = relatedTarget.contains(currentTarget)

    if (isInternalFocus || isAncestorFocus) {
      return
    }

    onBlur?.()
  }

  const fileName = selectedFile?.name ?? value?.split("/").pop()

  return (
    <label className={containerClassName}>
      {label && <span>{label}</span>}

      <div
        onBlur={handleBlur}
        className={mergeClassNames(
          "relative w-full p-2 border border-primary rounded-sm flex items-center h-fit gap-2 cursor-pointer",
          "focus-within:ring focus-within:ring-primary",
          isLoading && "opacity-50",
          error && "invalid-input"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />

        <Paperclip />

        <span
          className={mergeClassNames(
            "truncate grow",
            !fileName && "opacity-75"
          )}
        >
          {fileName ?? "Choose a file"}
        </span>

        {isLoading && <Loader size="sm" />}
        {!!fileName && !isLoading && (
          <button
            type="button"
            className="relative z-10 p-0 bg-transparent w-fit"
            onClick={handleClear}
          >
            <XCircleFill size={20} className="fill-primary" />
          </button>
        )}
      </div>

      {error && <span className="form-error">{error}</span>}
    </label>
  )
}
