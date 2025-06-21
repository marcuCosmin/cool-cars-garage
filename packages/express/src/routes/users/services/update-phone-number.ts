import { type Request, type Response } from "express"

import { firebaseAuth, firestore } from "../../../firebase/config"

import { getRequestingAdminUid } from "../utils"

type Verification = {
  phoneNumber: string
  code: string
  uid: string
}

type ReqBody = {
  code: string
  phoneNumber: string
  verificationId: string
}

export const handleUpdatePhoneNumberRequest = async (
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

    const { phoneNumber, code, verificationId } = req.body

    const verificationRef = firestore
      .collection("sms-verification")
      .doc(verificationId)

    const verification = await verificationRef.get()

    if (!verification.exists) {
      res.status(400).json({
        error: "The phone number doesn't match the verification ID"
      })

      return
    }

    const verificationData = verification.data() as Verification

    if (verificationData.uid !== requestingAdminUid) {
      res.status(403).json({
        error: "Unauthorized"
      })

      return
    }

    if (verificationData.phoneNumber !== phoneNumber) {
      res.status(400).json({
        error: "The provided phone number is invalid"
      })

      return
    }

    if (verificationData.code !== code) {
      res.status(400).json({
        error: "The provided verification code is invalid"
      })

      return
    }

    await firebaseAuth.updateUser(requestingAdminUid, {
      phoneNumber
    })

    await verificationRef.delete()

    res.status(200).json({ message: "Phone number updated successfully!" })
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
