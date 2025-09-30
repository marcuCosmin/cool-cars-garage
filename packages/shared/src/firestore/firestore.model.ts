export type DriverMetadata = {
  birthDate: number
  dbsUpdate: boolean
  badgeNumber?: string
  badgeExpirationDate?: number
  isTaxiDriver: boolean
  isPSVDriver: boolean
}

type AdminProps = {
  role: "admin"
}

type ManagerProps = {
  role: "manager"
}

type DriverProps = {
  role: "driver"
  metadata: DriverMetadata
}

export type UserBaseProps = {
  firstName: string
  lastName: string
  isActive: boolean
  creationTimestamp: number
}

export type UserDoc = UserBaseProps & (DriverProps | ManagerProps | AdminProps)

export type User = UserDoc & {
  uid: string
  email: string
}

export type ExistingUserInvitation = Pick<
  User,
  "uid" | "email" | "creationTimestamp"
>
export type NewUserInvitation = Pick<User, "email"> & UserDoc

export type InvitationDoc = ExistingUserInvitation | NewUserInvitation

export type DocWithID<T> = T & { id: string }

export type CheckAnswer = {
  label: string
  value: boolean
}

type CheckOdoReading = {
  unit: "km" | "miles"
  value: string
}

export type CheckDoc = {
  carId: string
  creationTimestamp: number
  driverId: string
  odoReading: CheckOdoReading
  interior: CheckAnswer[]
  exterior: CheckAnswer[]
  faultsCount?: number
  hasUnresolvedFaults?: boolean
  incidentsCount?: number
  hasUnresolvedIncidents?: boolean
}

type ReportsIssueStatus = "pending" | "resolved"

export type FaultDoc = {
  description: string
  driverId: string
  status: ReportsIssueStatus
  checkId: string
  creationTimestamp: number
  carId: string
  resolutionTimestamp?: number
}

export type IncidentDoc = {
  description: string
  driverId: string
  creationTimestamp: number
  status: ReportsIssueStatus
  checkId: string
  resolutionTimestamp?: number
}

export type CarDoc = {
  driverId: string
  make: string
  motExpiryTimestamp: number
  motStatus:
    | "No details held by DVLA"
    | "No results returned"
    | "Not valid"
    | "Valid"
  roadTaxExpiryTimestamp: number
  roadTaxStatus: "Not Taxed for on Road Use" | "SORN" | "Taxed" | "Untaxed"
  color: string
  fuelType: string
  co2Emissions: number
  engineCapacity: number
  lastIssuedV5CTimestamp: number
  monthOfFirstRegistration: string
  isOffRoad: boolean
}
