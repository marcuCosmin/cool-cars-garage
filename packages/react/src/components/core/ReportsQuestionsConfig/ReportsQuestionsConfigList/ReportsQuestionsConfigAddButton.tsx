import { PlusCircle } from "react-bootstrap-icons"

type ReportsQuestionsConfigAddButtonProps = {
  onClick: () => void
}

export const ReportsQuestionsConfigAddButton = ({
  onClick
}: ReportsQuestionsConfigAddButtonProps) => (
  <div className="flex items-center gap-2">
    <button type="button" className="w-fit" onClick={onClick}>
      <PlusCircle size={20} />
    </button>

    <hr className="text-primary border-0 border-t-2 border-dashed border-primary" />
  </div>
)
