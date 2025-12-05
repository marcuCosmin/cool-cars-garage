import {
  getDrivingLicenceNumberError,
  getEmailError,
  getNameError,
  getRequiredError
} from "./forms.utils"

import type { FormFieldsSchema } from "./forms.models"
import type {
  DriverDVLAData,
  DriverMetadata,
  User
} from "../firestore/firestore.model"
import type { CarsCheckExportURLQuery } from "../requests/requests.model"

export type UserInviteData = Pick<User, "role" | "email"> &
  Partial<Pick<User, "firstName" | "lastName">> &
  Partial<
    Omit<DriverMetadata, keyof Omit<DriverDVLAData, "drivingLicenceNumber">>
  >

export const userInviteFields: FormFieldsSchema<UserInviteData> = {
  drivingLicenceNumber: {
    type: "text",
    validate: getDrivingLicenceNumberError,
    shouldHide: ({ role }) => role !== "driver"
  },
  firstName: {
    type: "text",
    validate: getNameError,
    shouldHide: ({ role }) => role !== "manager"
  },
  lastName: {
    type: "text",
    validate: getNameError,
    shouldHide: ({ role }) => role !== "manager"
  },
  email: {
    validate: getEmailError,
    type: "text"
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
  badgeAuthority: {
    type: "select",
    options: ["PSV", "Cornwall", "Wolverhampton", "Portsmouth", "Other"],
    validate: getRequiredError,
    shouldHide: ({ role, isTaxiDriver }) => role !== "driver" || !isTaxiDriver
  },
  badgeExpirationTimestamp: {
    type: "date",
    validate: getRequiredError,
    shouldHide: ({ role, isTaxiDriver }) => role !== "driver" || !isTaxiDriver
  },
  isPSVDriver: {
    type: "toggle",
    shouldHide: ({ role }) => role !== "driver"
  }
}

type UserInviteEditableFields = Omit<UserInviteData, "drivingLicenceNumber">

export type UserEditData = Partial<UserInviteEditableFields> & {
  uid: User["uid"]
}

export const userEditFields = Object.entries(userInviteFields).reduce(
  (acc, [key, value]) => {
    if (key === "drivingLicenceNumber") {
      return acc
    }

    acc[key as keyof UserInviteEditableFields] = {
      ...value,
      isOptional: () => true
    }
    return acc
  },
  {} as FormFieldsSchema<UserInviteEditableFields>
)

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
