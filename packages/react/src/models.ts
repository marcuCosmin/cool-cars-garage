import { Timestamp } from "firebase-admin/firestore"

import * as icons from "react-bootstrap-icons"

export type UserRole = "admin" | "manager" | "user"

export type UserMetadata = {
  role: UserRole
}

export type Invitation = {
  email: string
  role: UserRole
  id: string
}

export type FieldValue = string | number | boolean | Timestamp

export type IconNames = keyof typeof icons
