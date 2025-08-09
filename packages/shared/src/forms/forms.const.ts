import { Timestamp } from "firebase-admin/firestore"

import { getEmailError, getRequiredError } from "./forms.utils"

import type { FormFieldsSchema } from "./forms.models"

import type { UserMetadata } from "../models"

export type InviteUserFields = {
  email: string
  role: UserMetadata["role"]
  dbsUpdate: boolean
  isTaxiDriver: boolean
  badgeNumber: number
  badgeExpirationDate: Timestamp
}

export const inviteUserFormFields: FormFieldsSchema<InviteUserFields> = {
  email: {
    validate: getEmailError,
    type: "text"
  },
  role: {
    type: "select",
    options: ["admin", "manager", "driver"] as UserMetadata["role"][],
    validate: getRequiredError
  },
  dbsUpdate: {
    type: "toggle",
    shouldBeIncluded: ({ role }) => role === "driver"
  },
  isTaxiDriver: {
    type: "toggle",
    shouldBeIncluded: ({ role }) => role === "driver"
  },
  badgeNumber: {
    type: "number",
    validate: getRequiredError,
    shouldBeIncluded: ({ role, isTaxiDriver }) =>
      role === "driver" && isTaxiDriver
  },
  badgeExpirationDate: {
    type: "date",
    validate: getRequiredError,
    shouldBeIncluded: ({ role, isTaxiDriver }) =>
      role === "driver" && isTaxiDriver
  }
}
