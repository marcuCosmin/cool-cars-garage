import { executeApiRequest } from "./config"

import type { InviteUserData } from "@/shared/forms/forms.const"

export const inviteUser = (payload: InviteUserData) =>
  executeApiRequest({
    path: "/users/invite",
    method: "POST",
    payload
  })
