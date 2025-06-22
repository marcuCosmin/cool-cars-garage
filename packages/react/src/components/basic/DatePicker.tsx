import { useState } from "react"
import Calendar from "react-calendar"
import { Popover } from "react-tiny-popover"

import { DateTime } from "luxon"

import { mergeClassNames } from "../../utils/mergeClassNames"

import type { FormFieldComponentProps } from "./Form/models"

type ValuePiece = Date | null

type Value = ValuePiece | [ValuePiece, ValuePiece]

export const DatePicker = ({
  label,
  value,
  onChange,
  error,
  onFocus
}: FormFieldComponentProps<string>) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const onPopupClose = () => setIsPopupOpen(false)
  const onClick = () => setIsPopupOpen(!isPopupOpen)
  const handleDateChange = (newValue: Value) => {
    if (newValue instanceof Date) {
      const newDate = newValue.toISOString()
      onChange(newDate)
      return
    }

    onChange()
  }

  const displayedValue = value ? DateTime.fromISO(value).toLocaleString() : ""
  const buttonClassName = mergeClassNames(
    "p-2 bg-transparent text-start font-normal text-nowrap border rounded-sm text-primary dark:text-secondary h-[40px]",
    error && "invalid-input"
  )

  const renderedContent = (
    <>
      <Popover
        positions={["bottom"]}
        content={
          <Calendar view="month" value={value} onChange={handleDateChange} />
        }
        isOpen={isPopupOpen}
        onClickOutside={onPopupClose}
      >
        <button
          className={buttonClassName}
          onFocus={onFocus}
          onClick={onClick}
          type="button"
        >
          <div className="overflow-hidden">{displayedValue}</div>
        </button>
      </Popover>

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

  return <div>{renderedContent}</div>
}
