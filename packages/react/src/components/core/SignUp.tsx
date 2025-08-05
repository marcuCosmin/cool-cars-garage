import { CircleAlert } from "lucide-react"

import { useQuery } from "@tanstack/react-query"

import { getFirestoreDoc } from "../../firebase/utils"

import { SignForm } from "./SignForm/SignForm"
import { Loader } from "../basic/Loader"

import type { Invitation } from "../../models"

type SignUpProps = {
  invitationId: string
}

export const SignUp = ({ invitationId }: SignUpProps) => {
  const queryFn = () => {
    return getFirestoreDoc<Omit<Invitation, "id">>({
      collection: "invitations",
      document: invitationId
    })
  }

  const { data: invitation, isLoading } = useQuery({
    queryKey: ["invitation"],
    queryFn
  })

  if (isLoading) {
    return <Loader enableOverlay text="Loading invitation" />
  }

  if (!invitation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <h1 className="flex items-center gap-2">
          Your invitation is no longer available <CircleAlert size={48} />
        </h1>

        <p>Contact the manager to send you a new one !</p>
      </div>
    )
  }

  return (
    <SignForm
      invitation={{ ...invitation, id: invitationId }}
      formType="sign-up"
    />
  )
}
