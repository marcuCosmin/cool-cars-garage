import type { ConfirmationModalContentProps } from "@/components/core/ConfirmationModalContent"

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
      props?: undefined
    }
