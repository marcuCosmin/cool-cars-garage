type DriverMetadataStatic = {
  birthDate: number
  dbsUpdate: boolean
  role: "driver"
}

export type DriverMetadata = DriverMetadataStatic &
  (
    | {
        badgeNumber?: string
        badgeExpirationDate?: number
        isTaxiDriver: true
      }
    | { isTaxiDriver: false }
  )

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
  creationTimestamp?: number
  phoneNumber?: string
  metadata: UserMetadata
}

export type InvitationDoc = Pick<User, "email"> & {
  creationTimestamp: number
  metadata: ManagerMetadata | AdminMetadata | Omit<DriverMetadata, "birthDate">
}
