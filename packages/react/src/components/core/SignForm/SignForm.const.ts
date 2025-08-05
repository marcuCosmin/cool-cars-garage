import { createUser } from "@/api/users"

import { signInUser, type SignInUser } from "@/firebase/utils"

import type { SignFormType } from "./SignForm.model"

type SignFormConfig = Record<
  SignFormType,
  {
    submitLabel: string
    authAction: SignInUser | typeof createUser
    emailDisabled: boolean
    link?: {
      href: string
      text: string
      label: string
    }
  }
>

export const signFormConfig: SignFormConfig = {
  "sign-in": {
    submitLabel: "Sign in",
    authAction: signInUser,
    emailDisabled: false
  },
  "sign-up": {
    submitLabel: "Sign up",
    link: {
      href: "/sign-in",
      text: "Sign in",
      label: "Already have an account?"
    },
    authAction: createUser,
    emailDisabled: true
  }
}
