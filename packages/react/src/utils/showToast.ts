import { toast } from "sonner"

type ShowToastProps = {
  type: "error" | "success"
  message: string
}

export const showToast = ({ type, message }: ShowToastProps) => {
  switch (type) {
    case "error":
      toast.error(message, {
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(message)
        }
      })
      break
    case "success":
      toast.success(message)
      break
  }
}
