import { type Request, type Response } from "express"

import { firestore } from "../../../firebase/config"

import { getRequestingAdminUid, sendSMS } from "../utils"

type ReqBody = {
  phoneNumber: string
}

const generateVerificationCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000)

  return code.toString()
}

const codeExpirationTime = 1000 * 60 * 10

export const handleSendVerificationSMSRequest = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  try {
    const authorizationHeader = req.headers.authorization

    const requestingAdminUid = await getRequestingAdminUid(authorizationHeader)

    if (!requestingAdminUid) {
      res.status(403).json({
        error: "Unauthorized"
      })

      return
    }

    const { phoneNumber } = req.body

    const existingSMSVerification = await firestore
      .collection("sms-verification")
      .where("uid", "==", requestingAdminUid)
      .where("phoneNumber", "==", phoneNumber)
      .get()

    if (!existingSMSVerification.empty) {
      res.status(400).json({
        error: "An SMS verification request has already been sent"
      })

      return
    }

    const code = generateVerificationCode()

    await sendSMS({
      phoneNumber,
      message: `Your verification code for Cool Cars Garage is ${code}.\nThe code expires in 10 minutes.`
    })

    const validity = codeExpirationTime

    const createdSMSVerificationDoc = await firestore
      .collection("sms-verification")
      .add({
        uid: requestingAdminUid,
        phoneNumber,
        code
      })

    setTimeout(() => createdSMSVerificationDoc.delete(), codeExpirationTime)

    res.status(200).json({
      verificationId: createdSMSVerificationDoc.id,
      validity
    })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: error.message
      })

      return
    }

    res.status(500).json({ error: `An unexpected error occurred: ${error}` })
  }
}
