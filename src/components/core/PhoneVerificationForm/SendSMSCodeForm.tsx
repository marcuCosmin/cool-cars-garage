import { getPhoneNumberVerificationId } from "../../../firebase/phoneNumber"

import { Form, type Fields } from "../../basic/Form"

const defaultActionState = {
  phoneNumber: ""
}

type ActionState = typeof defaultActionState

const fields: Fields<ActionState> = {
  phoneNumber: {
    label: "Phone number",
    type: "text",
    adornment: "+44"
    // validator: getPhoneNumberError
  }
}

type SendSMSCodeFormProps = {
  setVerificationId: (verificationId: string) => void
}

export const SendSMSCodeForm = ({
  setVerificationId
}: SendSMSCodeFormProps) => {
  const savePhoneNumberAction = async ({ phoneNumber }: ActionState) => {
    // const phoneNumberWithPrefix = `+44${phoneNumber}`
    const phoneNumberWithPrefix = `${phoneNumber}`

    const { verificationId, error } = await getPhoneNumberVerificationId(
      phoneNumberWithPrefix
    )

    if (!verificationId || error) {
      return error as string
    }

    setVerificationId(verificationId)
  }

  return (
    <Form<ActionState>
      containerClassName="fixed non-relative-center"
      title="Verify phone number"
      defaultActionState={defaultActionState}
      action={savePhoneNumberAction}
      submitLabel="Send verification code"
      fields={fields}
    >
      <div id="recaptcha-container" />
    </Form>
  )
}
