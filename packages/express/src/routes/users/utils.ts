import { firestore } from "@/firebase/config"

import { sendMail } from "@/utils/send-mail"
import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import type { InvitationDoc } from "@/shared/firestore/firestore.model"

export const inviteUser = async (
  invitationData: Omit<InvitationDoc, "creationTimestamp">
) => {
  const creationTimestamp = getCurrentTimestamp()
  const { email, role, firstName, lastName } = invitationData

  const invitationPayload: InvitationDoc = {
    email,
    role,
    creationTimestamp
  }

  if (firstName) {
    invitationPayload.firstName = firstName
  }

  if (lastName) {
    invitationPayload.lastName = lastName
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
            <div>You have been invited to join <a href="${process.env.ALLOWED_ORIGIN}">Cool Cars Garage</a>.</div>
            <div>Click <a href="${process.env.ALLOWED_ORIGIN}/sign-up?invitationId=${createdInvitation.id}">here</a> to accept the invitation.</div>
            <br/>
            <div>Thanks,</div>
            <b>Cool Cars Garage</b> team
          `
  })

  return createdInvitation.id
}
