import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { Info } from "lucide-react"

import { Form } from "../../basic/Form/Form"
import type { Fields } from "../../basic/Form/Form.models"

import { useAppDispatch, useAppSelector } from "../../../redux/config"
import { updateUser } from "../../../redux/userSlice"

import {
  sendSMSVerificationCode,
  updateUserPhoneNumber
} from "../../../api/users"

import { createValidator } from "../../../utils/validations"
import { secondsToUIFormat } from "../../../utils/secondsToUIFormat"

import { type SMSVerification } from "../../../api/users"

type FormFields = {
  code: string
}

type VerifySMSCodeProps = {
  phoneNumber: string
  verification: SMSVerification
  setVerification: (verification: SMSVerification) => void
}

export const VerifySMSCode = ({
  verification,
  phoneNumber,
  setVerification
}: VerifySMSCodeProps) => {
  const dispatch = useAppDispatch()
  const [remainingTime, setRemainingTime] = useState(verification.validity)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(prev => prev - 1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const { user } = useAppSelector(state => state.userReducer)

  const fields: Fields<FormFields> = {
    code: {
      label: "SMS code",
      type: "number",
      validator: createValidator({
        required: true,
        min: 6,
        max: 6,
        regex: {
          pattern: /^\d+$/,
          error: "Code must be a 6 digit number"
        }
      })
    }
  }

  const savePhoneNumberAction = async ({ code }: FormFields) => {
    const idToken = await user.getIdToken()

    const error = await updateUserPhoneNumber({
      idToken,
      phoneNumber,
      verificationId: verification.verificationId,
      code
    })

    if (error) {
      return error
    }

    dispatch(updateUser({ phoneNumber }))
  }

  const onSendNewCodeButtonClick = async () => {
    const idToken = await user.getIdToken()

    const { error, ...verification } = await sendSMSVerificationCode({
      phoneNumber,
      idToken
    })

    if (error) {
      toast.error(error)
      return
    }

    setVerification(verification as SMSVerification)

    toast.success(
      "New verification code sent. The code will expire in 10 minutes."
    )
  }

  return (
    <Form<FormFields>
      containerClassName="fixed non-relative-center"
      title="Verify SMS code"
      action={savePhoneNumberAction}
      submitLabel="Verify"
      fields={fields}
    >
      <div className="text-xs flex items-center w-full">
        <Info className="text-primary dark:text-secondary mr-2" size={20} />
        <div>
          {remainingTime ? (
            <>
              <p>
                We have sent a verification code at <b>{phoneNumber}</b>.
              </p>
              <p>
                The code will expire in{" "}
                <b>
                  {secondsToUIFormat({
                    ms: remainingTime,
                    displayFormat: "mm:ss"
                  })}
                </b>
                .
              </p>
            </>
          ) : (
            <>
              The code has expired. Click{" "}
              <button
                type="button"
                className="bg-transparent font-bold text-primary dark:text-secondary w-fit p-0 m-0 hover:opacity-70 transition-colors"
                onClick={onSendNewCodeButtonClick}
              >
                here
              </button>{" "}
              to send a new one.
            </>
          )}
        </div>
      </div>
    </Form>
  )
}
