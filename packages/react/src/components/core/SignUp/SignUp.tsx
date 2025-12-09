import { useQuery } from "@tanstack/react-query"

import { getFirestoreDoc } from "@/firebase/utils"

import { Loader } from "@/components/basic/Loader"

import { InvitationDoc } from "@/shared/firestore/firestore.model"

import { SignUpForm } from "./SignUpForm"

type SignUpProps = {
  invitationId: string
}

export const SignUp = ({ invitationId }: SignUpProps) => {
  const { data: invitation, isLoading } = useQuery({
    queryKey: ["invitation"],
    queryFn: () =>
      getFirestoreDoc<InvitationDoc>({
        collectionId: "invitations",
        docId: invitationId
      })
  })

  if (isLoading) {
    return <Loader enableOverlay text="Loading invitation" />
  }

  if (!invitation?.isActive) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <h1 className="flex items-center gap-2">
          Your invitation is no longer available
        </h1>

        <p>Contact the manager to send you a new one !</p>
      </div>
    )
  }

  return <SignUpForm invitation={{ ...invitation, id: invitationId }} />
}
