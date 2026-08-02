import type { User } from "../firestore/firestore.model"

export const formatUserName = ({
  firstName,
  lastName
}: Pick<User, "firstName" | "lastName">) => `${firstName} ${lastName}`
