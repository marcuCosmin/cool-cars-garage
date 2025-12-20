import { firebaseAuth } from "@/firebase/config"
import { getAuthUser } from "@/firebase/utils"

import type { Request, Response } from "@/models"

import type { UserActiveStateUpdatePayload } from "@/shared/requests/requests.model"

export const handleUserActiveStateUpdate = async (
  req: Request<undefined, undefined, UserActiveStateUpdatePayload>,
  res: Response
) => {
  const { uid, isActive } = req.body

  if (typeof isActive !== "boolean") {
    res.status(400).json({
      error: "Invalid active state value"
    })
    return
  }

  const authUser = await getAuthUser(uid)

  if (!authUser) {
    res.status(404).json({
      error: "User not found"
    })
    return
  }

  await firebaseAuth.updateUser(uid, {
    disabled: !isActive
  })

  res.status(200).json({
    message: `User ${isActive ? "activated" : "deactivated"} successfully`
  })
}
