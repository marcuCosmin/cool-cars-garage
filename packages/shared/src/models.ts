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
