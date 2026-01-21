import { InvitationDoc } from "@/globals/firestore/firestore.model"

export type Invitation = InvitationDoc & {
  id: string
}
