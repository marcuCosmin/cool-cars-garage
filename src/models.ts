import type { User as FirebaseUser } from "firebase/auth"

export type UserRole = "admin" | "user"

export type User = Pick<
  FirebaseUser,
  "displayName" | "email" | "emailVerified" | "phoneNumber" | "uid"
> & {
  role: UserRole
}
