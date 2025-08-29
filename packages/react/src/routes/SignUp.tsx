import { useSearchParams } from "react-router"

import { SignUp as SignUpCore } from "@/components/core/SignUp/SignUp"

import { NotFound } from "./NotFound"

export const SignUp = () => {
  const [searchParams] = useSearchParams()
  const invitationId = searchParams.get("invitationId")

  if (!invitationId) {
    return <NotFound />
  }

  return <SignUpCore invitationId={invitationId} />
}
