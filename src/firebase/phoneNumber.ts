import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  updatePhoneNumber,
  type User
} from "firebase/auth"

import { firebaseAuth } from "./config"

export const getPhoneNumberVerificationId = async (phoneNumber: string) => {
  try {
    const recaptchaVerifier = new RecaptchaVerifier(
      firebaseAuth,
      "recaptcha-container"
    )
    const phoneAuthProvider = new PhoneAuthProvider(firebaseAuth)

    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    )

    return { verificationId }
  } catch (error) {
    if (error instanceof Error) {
      // TODO: More descriptive error messages with a switch case
      return { error: error.message }
    }

    return { error: "An unknown error occurred" }
  }
}

type UpdatePhoneNumberArgs = {
  user: User
  verificationId: string
  verificationCode: string
}

export const updateUserPhoneNumber = async ({
  user,
  verificationId,
  verificationCode
}: UpdatePhoneNumberArgs) => {
  try {
    const phoneCredential = PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    )

    await updatePhoneNumber(user, phoneCredential)

    await user.getIdToken(true)
  } catch (error) {
    if (error instanceof Error) {
      // TODO: More descriptive error messages with a switch case
      return error.message
    }

    return "An unknown error occurred"
  }
}
