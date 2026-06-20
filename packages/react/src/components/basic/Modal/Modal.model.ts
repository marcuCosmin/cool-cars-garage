import type { ConfirmationModalProps } from "@/components/core/ConfirmationModal"
import type { UserFormProps } from "@/components/core/UserForm/UserForm"
import type { ResolveDefectModalProps } from "@/components/core/ResolveDefectModal"

export type ModalProps =
  | {
      type: "confirmation"
      props: ConfirmationModalProps
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
  | {
      type: "resolve-defect"
      props: ResolveDefectModalProps
    }
