import { NotFound } from "./NotFound"
import { SignUp as SignUpCore } from "../components/core/SignUp"

import { useUrlQueryParams } from "../hooks/useUrlQuery"

export const SignUp = () => {
  const { params } = useUrlQueryParams()
  const { invitationId } = params

  if (!invitationId) {
    return <NotFound />
  }

  return <SignUpCore invitationId={invitationId} />
}
