import type { ConfirmationModalContentProps } from "./ConfirmationModalContent"

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
