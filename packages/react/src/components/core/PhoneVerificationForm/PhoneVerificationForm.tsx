import { useState } from "react"

import { SendSMSCodeForm } from "./SendSMSCodeForm"
import { VerifySMSCode } from "./VerifySMSCode"

import { type SMSVerification } from "../../../api/users"

export const PhoneVerificationForm = () => {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verification, setVerification] = useState<
    SMSVerification | undefined
  >()

  if (!verification) {
    return (
      <SendSMSCodeForm
        setVerification={setVerification}
        setPhoneNumber={setPhoneNumber}
      />
    )
  }

  return (
    <VerifySMSCode
      setVerification={setVerification}
      verification={verification}
      phoneNumber={phoneNumber as string}
    />
  )
}
