import type { ConfirmationModalContentProps } from "@/components/core/ConfirmationModalContent"
import type { EditUserFormProps } from "@/components/core/EditUserForm"

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
      type: "invite-user"
      props?: undefined
    }
  | {
      type: "edit-user"
      props: EditUserFormProps
    }
