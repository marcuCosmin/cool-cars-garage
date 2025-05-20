import { useReduxSelector } from "../../../redux/config"

import { Form } from "../../basic/Form/Form"
import type { Fields } from "../../basic/Form/models"

import {
  sendSMSVerificationCode,
  type SMSVerification
} from "../../../api/users"

import { getPhoneNumberError } from "../../../utils/validations"

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
  const { user } = useReduxSelector(state => state.userReducer)

  const savePhoneNumberAction = async ({ phoneNumber }: FormFields) => {
    const phoneNumberWithPrefix = `+44${phoneNumber}`

    const idToken = await user.getIdToken()

    const { verificationId, validity, error } = await sendSMSVerificationCode({
      phoneNumber: phoneNumberWithPrefix,
      idToken
    })

    if (error) {
      return error as string
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
