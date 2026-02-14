import { firestore } from "@/backend/firebase/config"
import { getFirestoreDocs, isAuthEmail } from "@/backend/firebase/utils"
import { getCurrentTimestamp } from "@/backend/utils/get-current-timestamp"
import { getDVLAJWT } from "@/backend/utils/get-dvla-jwt"

import { type UserCreateData } from "@/globals/forms/forms.const"

import { sendMail } from "@/utils/send-mail"
import { getDVLADriverData } from "@/utils/get-dvla-driver-data"

import type {
  InvitationDoc,
  UserDoc
} from "@/globals/firestore/firestore.model"

export const inviteUser = async (
  invitationData: Omit<InvitationDoc, "creationTimestamp" | "isActive">
) => {
  const creationTimestamp = getCurrentTimestamp()
  const { email, role, uid } = invitationData

  const invitationPayload: InvitationDoc = {
    email,
    role,
    creationTimestamp,
    isActive: true,
    uid
  }

  const createdInvitation = await firestore
    .collection("invitations")
    .add(invitationPayload)

  await sendMail({
    to: email,
    subject: "Invitation to join Cool Cars Garage",
    html: `
            <div>Hello,</div>
            <br/>
            <div>You have been invited to join <b>Cool Cars Garage</b>.</div>
            <div>Click <a href="${process.env.ALLOWED_ORIGIN}/sign-up?invitationId=${createdInvitation.id}">here</a> to accept the invitation.</div>
            <br/>
            <div>Thanks,</div>
            <b>Cool Cars Garage</b> team
          `
  })
}

export const isEmailUsed = async (email: string) => {
  const emailIsUsedAuth = await isAuthEmail(email)

  if (emailIsUsedAuth) {
    return true
  }

  const [emailInvitation] = await getFirestoreDocs({
    collection: "invitations",
    queries: [["email", "==", email]]
  })

  if (emailInvitation) {
    return true
  }

  return false
}

export const getUserDocData = async ({
  drivingLicenceNumber,
  ...userPayloadData
}: Omit<UserCreateData, "email">): Promise<UserDoc> => {
  const creationTimestamp = getCurrentTimestamp()

  if (userPayloadData.role === "driver") {
    const dvlaJwt = await getDVLAJWT()
    const dvlaData = await getDVLADriverData({
      jwt: dvlaJwt,
      drivingLicenceNumber: drivingLicenceNumber as string
    })

    return {
      ...dvlaData,
      ...userPayloadData,
      creationTimestamp
    } as UserDoc
  }

  const { firstName, lastName, role } = userPayloadData

  return {
    role,
    firstName: firstName as string,
    lastName: lastName as string,
    creationTimestamp
  }
}
