import { type Request, type Response } from "express"

import { deleteUser } from "@/firebase/utils"

import type { User } from "@/shared/firestore/firestore.model"

type ReqQueries = Pick<User, "uid">

export const handleDeleteRequest = async (
  req: Request<undefined, undefined, undefined, ReqQueries>,
  res: Response
) => {
  const { uid } = req.query

  await deleteUser(uid)

  res.status(200).json({ message: "User deleted successfully" })
}
