import { Form } from "../../basic/Form/Form"
import type { Fields } from "../../basic/Form/Form.models"

import {
  sendSMSVerificationCode,
  type SMSVerification
} from "../../../api/users"

import { getPhoneNumberError } from "../../../utils/validations"
import { firebaseAuth } from "@/firebase/config"

type FormFields = {
  phoneNumber: string
}

const fields: Fields<FormFields> = {
  phoneNumber: {
    label: "Phone number",
    type: "text",
    startAdornment: "+44",
    validator: getPhoneNumberError
  }
}

type SendSMSCodeFormProps = {
  setVerification: (code: SMSVerification) => void
  setPhoneNumber: (phoneNumber: string) => void
}

export const SendSMSCodeForm = ({
  setVerification,
  setPhoneNumber
}: SendSMSCodeFormProps) => {
  const savePhoneNumberAction = async ({ phoneNumber }: FormFields) => {
    const phoneNumberWithPrefix = `+44${phoneNumber}`

    const idToken = await firebaseAuth.currentUser!.getIdToken()

    const { verificationId, validity, error } = await sendSMSVerificationCode({
      phoneNumber: phoneNumberWithPrefix,
      idToken
    })

    if (error) {
      return
    }

    setPhoneNumber(phoneNumberWithPrefix)

    setVerification({ validity, verificationId } as SMSVerification)
  }

  return (
    <Form<FormFields>
      containerClassName="fixed non-relative-center"
      title="Verify phone number"
      action={savePhoneNumberAction}
      submitLabel="Send verification code"
      fields={fields}
    />
  )
}
