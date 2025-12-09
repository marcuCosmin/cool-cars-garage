type Councils = "PSV" | "Cornwall" | "Wolverhampton" | "Portsmouth" | "Other"

export type DriverDVLAData = {
  drivingLicenceNumber: string
  birthTimestamp: number
  penaltyPoints: number
  cpcs: {
    lgvExpiryTimestamp: number
    pcvExpiryTimestamp: number
  }[]
  licenceType: "Full" | "Provisional"
  licenceStatus: "Valid" | "Disqualified"
  tachoCards: {
    cardNumber: string
    cardExpiryTimestamp: number
  }[]
  entitlements: {
    categoryCode: string
    categoryLegalLiteral: string
    categoryType: "Full" | "Provisional"
    activationTimestamp: number
    expiryTimestamp: number
  }[]
}

export type DriverMetadata = DriverDVLAData & {
  dbsUpdate: boolean
  badgeNumber?: string
  badgeExpirationTimestamp?: number
  badgeAuthority?: Councils
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

export type InvitationDoc = Pick<User, "email" | "role" | "uid"> &
  Partial<Pick<User, "firstName" | "lastName">> & {
    creationTimestamp: number
    isActive: boolean
  }

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
  faultsDetails?: string
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
  council: Councils
  hasOutstandingRecall: boolean
  isRental: boolean
}

export type NotificationConfigDoc = {
  checks: true
}

export type PhoneNumberDoc = {
  value: string
  label: string
  notifications: string[]
}

export type ReportsQuestion = {
  label: string
}

export type ReportsQuestionsDoc = {
  interior: ReportsQuestion[]
  exterior: ReportsQuestion[]
}

export type ReportsQuestionsSection = keyof ReportsQuestionsDoc

export type FullCheck = Omit<DocWithID<CheckDoc>, "driverId"> & {
  driver: Pick<DocWithID<UserDoc>, "id" | "firstName" | "lastName">
  faults: DocWithID<FaultDoc>[]
  incidents: DocWithID<IncidentDoc>[]
}

export type FirestoreCollectionsMap = {
  "cars": CarDoc
  "checks": CheckDoc
  "faults": FaultDoc
  "incidents": IncidentDoc
  "invitations": InvitationDoc
  "phone-numbers": PhoneNumberDoc
  "reports-config": ReportsQuestionsDoc
  "users": UserDoc
}

export type FirestoreCollectionsNames = keyof FirestoreCollectionsMap
