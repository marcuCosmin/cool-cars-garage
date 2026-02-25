import type { ConfirmationModalContentProps } from "@/components/core/ConfirmationModal"
import type { UserFormProps } from "@/components/core/UserForm/UserForm"

export type ModalProps =
  | {
      type: "confirmation"
      props: ConfirmationModalContentProps
    }
  | {
      type: "car"
      props?: undefined
    }
  | {
      type: "user"
      props: UserFormProps
    }
  | {
      type: "checks-bulk-export"
      props?: undefined
    }
