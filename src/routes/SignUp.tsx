import { NotFound } from "./NotFound"
import { SignUp as SignUpCore } from "../components/core/SignUp"

import { useUrlQueryParams } from "../hooks/useUrlQuery"

export const SignUp = () => {
  const { invitationId } = useUrlQueryParams()

  if (!invitationId) {
    return <NotFound />
  }

  return <SignUpCore invitationId={invitationId} />
}
