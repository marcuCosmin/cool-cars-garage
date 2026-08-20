import { sub as substractDate, type Duration } from "date-fns"

import { getNotificationPhoneNumbers } from "@/backend/firebase/utils"
import { sendWappMessages } from "@/backend/utils/send-wapp-messages"

import { formatUserName } from "@/globals/utils/formatUserName"
import { parseTimestampForDisplay } from "@/globals/utils/parseTimestampForDisplay"

import type { DocWithID, DriverUser } from "@/globals/firestore/firestore.model"

const badgeTimeBeforeNotificationsStart: Duration = {
  months: 3
}

export const handleExpiredBadgesNotifications = async (
  drivers: DocWithID<DriverUser>[]
) => {
  const currentDate = new Date()

  const expiringBadgeUsers = drivers.filter(({ badgeExpirationTimestamp }) => {
    if (!badgeExpirationTimestamp) {
      return false
    }

    const badgeExpirationDate = new Date(badgeExpirationTimestamp)

    const notificationStartDate = substractDate(
      badgeExpirationDate,
      badgeTimeBeforeNotificationsStart
    )
    const shouldSendNotification = notificationStartDate <= currentDate

    return shouldSendNotification
  })

  if (!expiringBadgeUsers.length) {
    console.log("No drivers with expiring badge found")
    return
  }

  const phoneNumbers = await getNotificationPhoneNumbers(
    "drivers-badge-expiration"
  )

  if (!phoneNumbers) {
    console.log(
      "No phone numbers configured for the 'drivers-badge-expiration' job"
    )
    return
  }

  for (const expiringBadgeUser of expiringBadgeUsers) {
    const { firstName, lastName, badgeExpirationTimestamp } = expiringBadgeUser
    console.log(firstName, lastName, badgeExpirationTimestamp)

    await sendWappMessages({
      template: {
        type: "driver_badge_expiration",
        params: {
          driver_name: formatUserName({ firstName, lastName }),
          expiration_date: parseTimestampForDisplay(
            badgeExpirationTimestamp as number
          )
        }
      },
      phoneNumbers
    })
  }
}
