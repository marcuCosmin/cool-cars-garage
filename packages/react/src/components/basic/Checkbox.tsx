import { Check2 } from "react-bootstrap-icons"

type CheckBoxProps = {
  value: boolean
  onChange: (value: boolean) => void
}

export const Checkbox = ({ value, onChange }: CheckBoxProps) => {
  const onClick = () => onChange(!value)

  return (
    <button
      onClick={onClick}
      className="w-6 h-6 bg-transparent border border-primary p-0"
    >
      {value && <Check2 size={20} className="fill-primary" />}
    </button>
  )
}
