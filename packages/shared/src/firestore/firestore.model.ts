export type DriverMetadata = {
  birthDate: number
  dbsUpdate: boolean
  badgeNumber?: string
  badgeExpirationDate?: number
  isTaxiDriver: boolean
  isPSVDriver: boolean
}

export type UserRole = "admin" | "manager" | "driver"

export type UserDoc = {
  firstName: string
  lastName: string
  isActive: boolean
  creationTimestamp: number
  role: UserRole
  metadata?: DriverMetadata
}

export type User = UserDoc & {
  uid: string
  email: string
  phoneNumber?: string
}

export type InvitationDoc = Pick<User, "email"> &
  UserDoc & {
    creationTimestamp: number
    uid: string
  }
