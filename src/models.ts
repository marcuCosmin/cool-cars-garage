export type UserRole = "admin" | "user"

export type UserMetadata = {
  role: UserRole
}

export type Invitation = {
  email: string
  role: UserRole
  id: string
}
