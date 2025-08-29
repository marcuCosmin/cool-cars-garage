import { InvitationDoc } from "@/shared/firestore/firestore.model"

export type Invitation = InvitationDoc & {
  id: string
}
