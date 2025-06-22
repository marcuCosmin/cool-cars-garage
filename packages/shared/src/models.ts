import { Timestamp } from "firebase-admin/firestore"

export type Car = {
  mot: Timestamp
  roadTax: Timestamp
  insurance: Timestamp
  safetyChecks?: Timestamp
  tachograph?: Timestamp
  wheelChairLift?: string
  wheelChairLiftCheck?: Timestamp
  plateNumber?: Timestamp
  expireDate?: Timestamp
  cornwallMot?: Timestamp
  registrationNumber: string
  council: string
  makeAndModel: string
  driver: string
  type: string
  route: string
}
