import { Timestamp } from "firebase/firestore"

import * as icons from "react-bootstrap-icons"

export type UserRole = "admin" | "user"

export type UserMetadata = {
  role: UserRole
}

export type Invitation = {
  email: string
  role: UserRole
  id: string
}

export type FieldValue = string | number | boolean | Timestamp

export type Car = {
  mot: number
  roadTax: number
  insurance: number
  safetyChecks?: number
  tachograph?: number
  wheelChairLift?: string
  wheelChairLiftCheck?: number
  plateNumber?: number
  expireDate?: number
  cornwallMot?: number
  registrationNumber: string
  council: string
  makeAndModel: string
  driver: string
  type: string
  route: string
}

export type IconNames = keyof typeof icons
