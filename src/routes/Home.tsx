import { Plus } from "lucide-react"
import { ActionModal } from "../components/core/ActionModal"
import { AddCarForm } from "../components/core/AddCarForm"

export const Home = () => {
  return (
    <div>
      <ActionModal
        buttonContent={
          <Plus
            className="fill-secondary dark:fill-primary bg-primary dark:bg-secondary rounded-full p-1.5"
            width={40}
            height={40}
          />
        }
      >
        <AddCarForm />
      </ActionModal>
    </div>
  )
}
