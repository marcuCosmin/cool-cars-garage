import { firestore } from "@/backend/firebase/config"
import { getFirestoreDocs } from "@/backend/firebase/utils"
import { getCurrentTimestamp } from "@/backend/utils/get-current-timestamp"

import type { JobScript } from "@/models"

const run = async () => {
  const currentTimestamp = getCurrentTimestamp()

  const invitations = await getFirestoreDocs({
    collection: "invitations",
    queries: [["isActive", "==", true]]
  })

  if (!invitations.length) {
    console.log("No active invitations found.")
    return
  }

  let deactivatedCount = 0

  const batch = firestore.batch()

  invitations.forEach(({ creationTimestamp, id }) => {
    const isExpired =
      currentTimestamp - creationTimestamp >= 24 * 60 * 60 * 1000

    if (!isExpired) {
      return
    }

    const invitationRef = firestore.collection("invitations").doc(id)
    batch.update(invitationRef, { isActive: false })

    deactivatedCount++
  })

  if (!deactivatedCount) {
    console.log("No expired invitations to deactivate.")
    return
  }

  console.log(`Deactivating ${deactivatedCount} expired invitations...`)
  await batch.commit()
  console.log(`Deactivated ${deactivatedCount} expired invitations!`)
}

export const deactivateInvitationsJob: JobScript = {
  id: "deactivate-invitations",
  run
}
