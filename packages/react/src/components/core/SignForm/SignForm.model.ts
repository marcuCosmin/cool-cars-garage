import type { Invitation } from "@/models"

export type SignFormType = "sign-in" | "sign-up"

export type SignFormProps = {
  formType: SignFormType
  invitation?: Invitation
}

export type SignFormFields = {
  email: string
  password: string
  firstName?: string
  lastName?: string
}
