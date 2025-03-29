import { updateUserPhoneNumber } from "../../../firebase/phoneNumber"

import { Form, type Fields } from "../../basic/Form"

import { useReduxSelector } from "../../../redux/config"

const defaultActionState = {
  verificationCode: ""
}

type ActionState = typeof defaultActionState

const fields: Fields<ActionState> = {
  verificationCode: {
    label: "SMS code",
    type: "text"
  }
}

type VerifySMSCodeProps = {
  verificationId: string
}

export const VerifySMSCode = ({ verificationId }: VerifySMSCodeProps) => {
  const { user } = useReduxSelector(state => state.userReducer)

  const savePhoneNumberAction = async ({ verificationCode }: ActionState) => {
    const error = await updateUserPhoneNumber({
      user,
      verificationId,
      verificationCode
    })

    if (error) {
      return error
    }
  }

  return (
    <Form<ActionState>
      containerClassName="fixed non-relative-center"
      title="Verify SMS code"
      defaultActionState={defaultActionState}
      action={savePhoneNumberAction}
      submitLabel="Verify"
      fields={fields}
    />
  )
}
