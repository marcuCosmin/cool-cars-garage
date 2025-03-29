import { useState } from "react"

import { SendSMSCodeForm } from "./SendSMSCodeForm"
import { VerifySMSCode } from "./VerifySMSCode"

export const PhoneVerificationForm = () => {
  const [verificationId, setVerificationId] = useState("")

  if (!verificationId) {
    return <SendSMSCodeForm setVerificationId={setVerificationId} />
  }

  return <VerifySMSCode verificationId={verificationId} />
}
