export type DriverMetadata = {
  birthDate: number
  dbsUpdate: boolean
  role: "driver"
  badgeNumber?: string
  badgeExpirationDate?: number
  isTaxiDriver: boolean
  isPSVDriver: boolean
  v5: string
}

export type ManagerMetadata = {
  role: "manager"
}

export type AdminMetadata = {
  role: "admin"
}

export type UserMetadata = DriverMetadata | ManagerMetadata | AdminMetadata

export type User = {
  uid: string
  email: string
  displayName: string
  isActive: boolean
  metadata: UserMetadata
  creationTimestamp: number
  phoneNumber?: string
}

export type InvitationDoc = Pick<User, "email"> & {
  creationTimestamp: number
  metadata: UserMetadata
}
