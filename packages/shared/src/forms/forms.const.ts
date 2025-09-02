import { getEmailError, getNameError, getRequiredError } from "./forms.utils"

import type { FormFieldsSchema } from "./forms.models"

import type {
  DriverMetadata,
  InvitationDoc,
  User,
  UserMetadata
} from "../firestore/firestore.model"

export type InviteUserFormData = Omit<
  User,
  "metadata" | "uid" | "creationTimestamp" | "isActive"
> &
  User["metadata"]

export const inviteUserFormFields: FormFieldsSchema<InviteUserFormData> = {
  email: {
    validate: getEmailError,
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
    options: ["admin", "manager", "driver"] as UserMetadata["role"][],
    validate: getRequiredError
  },
  v5: {
    type: "text",
    validate: getRequiredError,
    shouldHide: ({ role }) => role !== "driver"
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

export type EditUserFormData = Pick<User, "email"> &
  Pick<UserMetadata, "role"> &
  Omit<DriverMetadata, "role">

export type EditUserData = EditUserFormData & {
  uid: string
}

export const editUserFormFields: FormFieldsSchema<EditUserFormData> = {
  ...inviteUserFormFields
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
