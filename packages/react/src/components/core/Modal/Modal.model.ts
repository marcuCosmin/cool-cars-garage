import type { ConfirmationModalContentProps } from "@/components/core/ConfirmationModalContent"
import type { UserFormProps } from "@/components/core/UserForm/UserForm"

export type ModalOptions =
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
