import { useState } from "react"
import Calendar from "react-calendar"
import { Popover } from "react-tiny-popover"

import { Timestamp } from "firebase/firestore"

import { mergeClassNames } from "../../utils/mergeClassNames"

import type { FormFieldComponentProps } from "./Form/models"

type ValuePiece = Date | null

type Value = ValuePiece | [ValuePiece, ValuePiece]

export const DatePicker = ({
  label,
  value,
  onChange,
  error,
  onBlur
}: FormFieldComponentProps<Timestamp>) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const onPopupClose = () => setIsPopupOpen(false)
  const onClick = () => setIsPopupOpen(!isPopupOpen)
  const handleDateChange = (newValue: Value) => {
    if (newValue instanceof Date) {
      const newDate = new Timestamp(newValue.getTime() / 1000, 0)
      onChange(newDate)
      return
    }

    onChange()
  }

  const date = value ? value.toDate() : null
  const displayedValue = date ? date.toLocaleDateString() : ""
  const buttonClassName = mergeClassNames(
    "p-2 bg-transparent text-start font-normal text-nowrap border rounded-sm text-primary dark:text-secondary h-[40px]",
    error && "invalid-input"
  )

  const renderedContent = (
    <>
      <Popover
        positions={["bottom"]}
        content={
          <Calendar
            view="month"
            value={date?.toDateString()}
            onChange={handleDateChange}
          />
        }
        isOpen={isPopupOpen}
        onClickOutside={onPopupClose}
      >
        <button
          className={buttonClassName}
          onFocus={onBlur}
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
