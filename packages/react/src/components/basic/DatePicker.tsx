import { useRef, type FocusEvent, type MouseEvent } from "react"
import { X } from "react-bootstrap-icons"
import Calendar from "react-calendar"

import { Dropdown } from "@/components/basic/Dropdown/Dropdown"

import { mergeClassNames } from "@/utils/mergeClassNames"

import type { FormFieldComponentProps } from "./Form/Form.models"

type ValuePiece = Date | null

type Value = ValuePiece | [ValuePiece, ValuePiece]

export type DatePickerProps = FormFieldComponentProps<number | undefined> & {
  includeEndOfDay?: boolean
}

export const DatePicker = ({
  label,
  value,
  onChange,
  error,
  onBlur,
  includeEndOfDay = false
}: DatePickerProps) => {
  const calendarRef = useRef<HTMLDivElement>(null)

  const date = value ? new Date(value) : null
  const displayedValue = date ? date.toLocaleDateString() : ""
  const buttonClassName = mergeClassNames(
    "flex items-center justify-between p-2 bg-transparent text-start font-normal text-nowrap border border-primary rounded-sm text-primary dark:text-secondary h-input focus:ring-primary hover:opacity-100",
    error && "invalid-input"
  )
  const adornmentClassName = mergeClassNames(
    "fill-primary h-6 w-6 hover:fill-primary/80",
    error && "fill-error"
  )
  const handleDateChange = (date: Value) => {
    if (date instanceof Date) {
      if (includeEndOfDay) {
        date.setHours(23, 59, 59, 999)
      } else {
        date.setHours(0, 0, 0, 0)
      }

      const value = date.getTime()
      onChange(value)
      return
    }

    onChange()
  }

  const onClearClick = (e: MouseEvent<SVGElement>) => {
    e.stopPropagation()
    onChange()
  }

  const handleBlur = ({ relatedTarget }: FocusEvent<HTMLButtonElement>) => {
    if (!onBlur) {
      return
    }

    if (calendarRef.current?.contains(relatedTarget)) {
      return
    }

    onBlur()
  }

  const renderedContent = (
    <>
      <Dropdown
        title={
          <>
            <div className="overflow-hidden">{displayedValue}</div>
            {value && (
              <X className={adornmentClassName} onClick={onClearClick} />
            )}
          </>
        }
        popoverClassName="p-0 border-0"
        buttonClassName={buttonClassName}
        onBlur={handleBlur}
      >
        <Calendar
          inputRef={calendarRef}
          value={date?.toDateString()}
          onChange={handleDateChange}
          minDetail="decade"
        />
      </Dropdown>

      {error && <span className="form-error">{error}</span>}
    </>
  )

  if (label) {
    return (
      <label>
        <div>{label}</div>
        {renderedContent}
      </label>
    )
  }

  return <div className="w-full max-w-sm">{renderedContent}</div>
}
