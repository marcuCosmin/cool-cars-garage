import axios from "axios"

import { firebaseAuth, firestore } from "../../firebase/config"

import type { UserMetadata } from "../../models"
import { sendMail } from "@/utils/send-mail"
import { getCurrentTimestamp } from "@/utils/get-current-timestamp"
import { InvitationDoc } from "@/shared/firestore/firestore.model"

const getUserMetadata = async (uid: string) => {
  const userRef = firestore.collection("users").doc(uid)
  const userDoc = await userRef.get()

  if (!userDoc.exists) {
    return null
  }

  return userDoc.data() as UserMetadata
}

export const getRequestingAdminUid = async (
  authorizationHeader: string | undefined
) => {
  try {
    const idToken = authorizationHeader?.split("Bearer ")[1]

    if (!idToken) {
      return null
    }

    const { uid } = await firebaseAuth.verifyIdToken(idToken)

    const userMetadata = await getUserMetadata(uid)

    const isAdmin = userMetadata?.role === "admin"

    if (!isAdmin) {
      return null
    }

    return uid
  } catch {
    return null
  }
}

type SendSMSOptions = {
  phoneNumber: string
  message: string
}

export const sendSMS = ({ phoneNumber, message }: SendSMSOptions) =>
  axios.post(
    `https://xkjev4.api.infobip.com/sms/3/messages`,
    {
      messages: [
        {
          destinations: [
            {
              to: phoneNumber
            }
          ],
          content: {
            text: message
          }
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `App ${process.env.INFOBIP_API_KEY}`
      }
    }
  )

export const inviteUser = async (
  invitationData: Omit<InvitationDoc, "creationTimestamp">
) => {
  const { email } = invitationData

  const invitation = {
    ...invitationData,
    creationTimestamp: getCurrentTimestamp()
  }

  const createdInvitation = await firestore
    .collection("invitations")
    .add(invitation)

  await sendMail({
    to: email,
    subject: "Invitation to join Cool Cars Garage",
    html: `
            <div>Hello,</div>
            <br/>
            <div>You have been invited to join <a href="${process.env.ALLOWED_ORIGIN}">Cool Cars Garage</a>.</div>
            <div>Click <a href="${process.env.ALLOWED_ORIGIN}/sign-up?invitationId=${createdInvitation.id}">here</a> to accept the invitation.</div>
            <br/>
            <div>Thanks,</div>
            <b>Cool Cars Garage</b> team
          `
  })
}
