import { getEmailError, getRequiredError } from "./forms.utils"

import type { FormFieldsSchema } from "./forms.models"

import type { DriverMetadata, User, UserMetadata } from "../models"

export type InviteUserData = Pick<User, "email"> &
  Pick<UserMetadata, "role"> &
  Partial<Omit<DriverMetadata, "role" | "birthDate">>

export const inviteUserFormFields: FormFieldsSchema<InviteUserData> = {
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
    shouldHide: ({ role }) => role !== "driver"
  },
  isTaxiDriver: {
    type: "toggle",
    shouldHide: ({ role }) => role !== "driver"
  },
  badgeNumber: {
    type: "number",
    validate: getRequiredError,
    shouldHide: ({ role, isTaxiDriver }) => role !== "driver" || !isTaxiDriver
  },
  badgeExpirationDate: {
    type: "date",
    validate: getRequiredError,
    shouldHide: ({ role, isTaxiDriver }) => role !== "driver" || !isTaxiDriver
  }
}
