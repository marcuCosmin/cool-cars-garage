import { getEmailError, getNameError, getRequiredError } from "./forms.utils"

import type { FormFieldsSchema } from "./forms.models"

import type { DriverMetadata, User } from "../firestore/firestore.model"
import type { CarsCheckExportURLQuery } from "../requests/requests.model"

export type UserCreateData = Omit<
  User,
  "uid" | "creationTimestamp" | "isActive" | "email"
> &
  Partial<Pick<User, "email">> &
  Partial<DriverMetadata>

export const userCreateFields: FormFieldsSchema<UserCreateData> = {
  email: {
    validate: getEmailError,
    isOptional: ({ role, isPSVDriver }) => role === "driver" && !isPSVDriver,
    type: "text"
  },
  firstName: {
    validate: getNameError,
    type: "text"
  },
  lastName: {
    validate: getNameError,
    type: "text"
  },
  birthDate: {
    type: "date",
    validate: getRequiredError,
    shouldHide: ({ role }) => role !== "driver"
  },
  role: {
    type: "select",
    options: ["manager", "driver"],
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
  },
  isPSVDriver: {
    type: "toggle",
    shouldHide: ({ role }) => role !== "driver"
  }
}

export type UserEditData = UserCreateData & { uid: User["uid"] }

export type SignInFormData = Pick<User, "email"> & {
  password: string
}

export const signInFormFields: FormFieldsSchema<SignInFormData> = {
  email: {
    validate: getEmailError,
    type: "text"
  },
  password: {
    validate: getRequiredError,
    type: "password"
  }
}

export type SignUpFormData = SignInFormData

export type SignUpData = SignUpFormData & {
  invitationId: string
}

export const signUpFormFields: FormFieldsSchema<SignUpFormData> = {
  ...signInFormFields
}

export type ChecksBulkExportData = Omit<
  Extract<CarsCheckExportURLQuery, { type: "bulk" }>,
  "type"
>

export const checksBulkExportFormFields: FormFieldsSchema<ChecksBulkExportData> =
  {
    startTimestamp: {
      type: "date",
      validate: getRequiredError
    },
    endTimestamp: {
      type: "date",
      validate: getRequiredError
    }
  }
