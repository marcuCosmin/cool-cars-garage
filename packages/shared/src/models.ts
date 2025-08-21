export type CarChecks = {
  mot: number
  roadTax: number
  insurance: number
  safetyChecks?: number
  tachograph?: number
  wheelChairLift?: string
  wheelChairLiftCheck?: number
  plateNumberExpiryDate?: number
  cornwallMot?: number
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
  badgeExpirationDate: number
  birthDate: number
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
