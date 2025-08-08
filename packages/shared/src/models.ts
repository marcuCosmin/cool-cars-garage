import { Timestamp } from "firebase-admin/firestore"

export type CarChecks = {
  mot: Timestamp
  roadTax: Timestamp
  insurance: Timestamp
  safetyChecks?: Timestamp
  tachograph?: Timestamp
  wheelChairLift?: string
  wheelChairLiftCheck?: Timestamp
  plateNumberExpiryDate?: Timestamp
  cornwallMot?: Timestamp
}

export type Car = CarChecks & {
  wheelChairLift?: string
  plateNumber?: string
  registrationNumber: string
  council: string
  makeAndModel: string
  drivers: string
  type: string
  route: string
}

export type CarCheckField = keyof CarChecks

export type DriverMetadata = {
  badgeNumber: string
  badgeExpirationDate: Timestamp
  birthDate: Timestamp
  isTaxiDriver: boolean
  dbsUpdate: boolean
  role: "driver"
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
  metadata: UserMetadata
}
