import { sendSMSVerificationCode } from "../../../api/users"
import { useReduxSelector } from "../../../redux/config"

import { Form, type Fields } from "../../basic/Form"

import { type SMSVerification } from "../../../api/users"

import { getPhoneNumberError } from "../../../utils/validations"

const defaultActionState = {
  phoneNumber: ""
}

type ActionState = typeof defaultActionState

const fields: Fields<ActionState> = {
  phoneNumber: {
    label: "Phone number",
    type: "text",
    adornment: "+44",
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

  const savePhoneNumberAction = async ({ phoneNumber }: ActionState) => {
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
    <Form<ActionState>
      containerClassName="fixed non-relative-center"
      title="Verify phone number"
      defaultActionState={defaultActionState}
      action={savePhoneNumberAction}
      submitLabel="Send verification code"
      fields={fields}
    />
  )
}
