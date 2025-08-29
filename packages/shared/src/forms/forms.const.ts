import { getEmailError, getNameError, getRequiredError } from "./forms.utils"

import type { FormFieldsSchema } from "./forms.models"

import type {
  DriverMetadata,
  InvitationDoc,
  User,
  UserMetadata
} from "../firestore/firestore.model"

export type InviteUserFormData = Pick<User, "email"> &
  Pick<UserMetadata, "role"> &
  Partial<
    Omit<Extract<DriverMetadata, { isTaxiDriver: true }>, "birthDate" | "role">
  >

export const inviteUserFormFields: FormFieldsSchema<InviteUserFormData> = {
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

export type SignUpFormData = SignInFormData & {
  firstName: string
  lastName: string
  birthDate?: number
}

export type SignUpData = Omit<SignUpFormData, "role"> & {
  invitationId: string
}

export const getSignUpFormFields = ({
  metadata: { role }
}: InvitationDoc): FormFieldsSchema<SignUpFormData> => ({
  ...signInFormFields,
  firstName: {
    validate: getNameError,
    type: "text"
  },
  lastName: {
    validate: getNameError,
    type: "text"
  },
  birthDate: {
    validate: getRequiredError,
    type: "date",
    shouldHide: () => role !== "driver"
  }
})
