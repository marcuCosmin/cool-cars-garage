import { useRef, useState, type FocusEvent } from "react"
import { Calendar4Week } from "react-bootstrap-icons"
import Calendar from "react-calendar"
import { Popover } from "react-tiny-popover"

import { Timestamp } from "firebase/firestore"

import { mergeClassNames } from "../../utils/mergeClassNames"

import type { FormFieldComponentProps } from "./Form/Form.models"

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
  const calendarRef = useRef<HTMLDivElement>(null)

  const date = value ? value.toDate() : null
  const displayedValue = date ? date.toLocaleDateString() : ""
  const buttonClassName = mergeClassNames(
    "flex items-center justify-between p-2 bg-transparent text-start font-normal text-nowrap border border-primary rounded-sm text-primary dark:text-secondary h-input focus:ring-primary",
    error && "invalid-input"
  )
  const adornmentClassName = mergeClassNames(
    "fill-primary h-5 w-5",
    error && "fill-error"
  )

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
      <Popover
        padding={2}
        positions={["bottom"]}
        content={
          <Calendar
            inputRef={calendarRef}
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
          onBlur={handleBlur}
          onClick={onClick}
          type="button"
        >
          <div className="overflow-hidden">{displayedValue}</div>
          <Calendar4Week className={adornmentClassName} />
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
