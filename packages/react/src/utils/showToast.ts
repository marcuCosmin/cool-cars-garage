import { toast } from "sonner"

type ShowToastProps = {
  type: "error" | "success" | "warning"
  message: string
  details?: string[]
}

const getCopyAction = (text: string) => ({
  label: "Copy",
  onClick: () => navigator.clipboard.writeText(text)
})

export const showToast = ({ type, message, details }: ShowToastProps) => {
  switch (type) {
    case "error":
      toast.error(message, { action: getCopyAction(message) })
      break
    case "warning": {
      const detailsText = details?.join("\n")

      toast.warning(message, {
        action: detailsText
          ? {
              label: "See more",
              onClick: () =>
                toast.warning(detailsText, {
                  duration: Infinity,
                  style: { whiteSpace: "pre-line" },
                  action: getCopyAction(detailsText)
                })
            }
          : getCopyAction(message)
      })
      break
    }
    case "success":
      toast.success(message)
      break
  }
}
