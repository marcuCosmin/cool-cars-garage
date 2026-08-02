import {
  getFirestoreDocs,
  getNotificationPhoneNumbers
} from "@/backend/firebase/utils"
import { sendWappMessages } from "@/backend/utils/send-wapp-messages"
import { formatUserName } from "@/globals/utils/formatUserName"

import type {
  DocWithID,
  FaultDoc,
  IncidentDoc
} from "@/globals/firestore/firestore.model"

const remindersConfig = {
  faults: {
    notificationId: "faults-reported",
    whatsAppTemplateId: "faults_reported"
  },
  incidents: {
    notificationId: "incident-reported",
    whatsAppTemplateId: "incident_reported"
  }
}

type SendDefectRemindersProps<T extends FaultDoc | IncidentDoc> = {
  defects: DocWithID<T>[]
  type: T extends FaultDoc ? "faults" : "incidents"
}
export const sendDefectReminders = async <T extends FaultDoc | IncidentDoc>({
  defects,
  type
}: SendDefectRemindersProps<T>) => {
  if (!defects.length) {
    console.log(`No unresolved ${type} to send reminders for`)
    return
  }

  const { notificationId, whatsAppTemplateId } = remindersConfig[type]

  const defectsByCheckId = defects.reduce(
    (acc, defect) => {
      if (!acc[defect.checkId]) {
        acc[defect.checkId] = []
      }

      acc[defect.checkId].push(defect)

      return acc
    },
    {} as Record<string, DocWithID<T>[]>
  )

  const checksIds = Object.keys(defectsByCheckId)
  const driversIds = Array.from(
    new Set(defects.map(({ driverId }) => driverId))
  )

  const [checks, drivers, phoneNumbers] = await Promise.all([
    getFirestoreDocs({ collection: "checks", ids: checksIds }),
    getFirestoreDocs({ collection: "users", ids: driversIds }),
    getNotificationPhoneNumbers(notificationId)
  ])

  if (!phoneNumbers.length) {
    console.log(`No phone numbers found for ${notificationId} reminders`)
    return
  }

  const messagesPromises = Object.entries(defectsByCheckId).map(
    ([checkId, checkDefects]) => {
      const [{ driverId }] = checkDefects

      const driver = drivers.find(({ id }) => id === driverId)
      const check = checks.find(({ id }) => id === checkId)

      const driverName = driver ? formatUserName(driver) : "Unknown"
      const carRegNumber = check?.carId ?? "Unknown"

      const template =
        whatsAppTemplateId === "faults_reported"
          ? {
              type: "faults_reported" as const,
              params: {
                driver_name: driverName,
                car_reg_number: carRegNumber,
                faults_count: checkDefects.length.toString()
              },
              check_id: checkId
            }
          : {
              type: "incident_reported" as const,
              params: {
                driver_name: driverName,
                car_reg_number: carRegNumber
              },
              check_id: checkId
            }

      return sendWappMessages({ phoneNumbers, template })
    }
  )

  await Promise.all(messagesPromises)
}
