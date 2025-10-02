import { type Response } from "express"
import PDFDocument from "pdfkit"

import { firestore } from "@/firebase/config"

import type { Request } from "@/models"

import { parseTimestampForDisplay } from "@/shared/utils/parseTimestampForDisplay"
import { capitalize } from "@/shared/utils/capitalize"

import type { CarsCheckExportURLQuery } from "@/shared/requests/requests.model"
import type {
  CheckAnswer,
  CheckDoc,
  FaultDoc,
  UserDoc
} from "@/shared/firestore/firestore.model"

export const handleCarChecksExports = async (
  req: Request<
    undefined,
    undefined,
    undefined,
    Partial<CarsCheckExportURLQuery>
  >,
  res: Response
) => {
  const { type } = req.query

  if (type !== "individual" && type !== "bulk") {
    res.status(400).json({ error: "Invalid or missing type parameter" })
    return
  }

  if (type === "individual") {
    const { checkId } = req.query

    if (!checkId || typeof checkId !== "string") {
      res.status(400).json({ error: "Missing or invalid checkId parameter" })
      return
    }

    const checkRef = firestore.collection("checks").doc(checkId)

    const checkDoc = await checkRef.get()

    if (!checkDoc.exists) {
      res.status(404).json({ error: "Check not found" })
      return
    }

    const check = checkDoc.data() as CheckDoc
    const usersRef = firestore.collection("users")
    const driverDoc = await usersRef.doc(check.driverId).get()

    if (!driverDoc.exists) {
      res.status(404).json({ error: "Driver not found" })
      return
    }

    const driverData = driverDoc.data() as UserDoc

    const faultsQuery = firestore
      .collection("faults")
      .where("checkId", "==", checkId)
    const faultsSnapshot = await faultsQuery.get()
    const faults = faultsSnapshot.docs.map(doc => doc.data()) as FaultDoc[]

    const pdfDoc = new PDFDocument({
      margin: 25
    })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", 'inline; filename="example.pdf"')

    pdfDoc.pipe(res)

    pdfDoc
      .fontSize(10)
      .fillColor("#007bff")
      .font("Helvetica-Bold")
      .text("COOL CARS SOUTH COAST LIMITED")
    pdfDoc.moveDown(1)
    pdfDoc
      .fontSize(18)
      .text(`Check Report - ${check.carId}`, { align: "center" })
      .fillColor("#007bff")
    pdfDoc.moveDown(0.5)
    pdfDoc
      .fontSize(13)
      .text(parseTimestampForDisplay(check.creationTimestamp), {
        align: "center"
      })
    pdfDoc.moveDown(0.5)
    pdfDoc
      .fontSize(13)
      .text(`Reported by: ${driverData.firstName} ${driverData.lastName}`, {
        align: "center"
      })
    pdfDoc.moveDown(0.5)
    pdfDoc
      .fontSize(13)
      .text(
        `Odometer reading: ${check.odoReading.value}${check.odoReading.unit}`,
        {
          align: "center"
        }
      )
    pdfDoc.moveDown()
    pdfDoc.font("Helvetica")

    const getDisplayedFaultStatus = (fault?: FaultDoc) => {
      if (!fault) {
        return
      }

      const { status, resolutionTimestamp } = fault

      let displayedStatus = capitalize(status)

      if (status === "resolved") {
        displayedStatus += `\n${parseTimestampForDisplay(
          resolutionTimestamp as number
        )}`
      }

      return displayedStatus
    }

    const getAnswersTableRows = (
      section: CheckAnswer[]
      // eslint-disable-next-line no-undef
    ): PDFKit.Mixins.CellOptions[][] =>
      section.map(({ label, value }) => {
        const fault = faults.find(({ description }) => description === label)

        return [
          {
            text: label,
            align: "center",
            font: { family: "Helvetica", size: 10 }
          },
          {
            text: value ? "Passed" : "Failed",
            align: "center",
            font: { family: "Helvetica", size: 10 }
          },
          {
            text: getDisplayedFaultStatus(fault),
            align: "center",
            font: { family: "Helvetica", size: 10 }
          }
        ]
      })

    pdfDoc.table({
      columnStyles: ["*", 75, 75],
      defaultStyle: { borderColor: "#007bff", padding: 5 },
      data: [
        [
          {
            text: "Question",
            align: "center",
            textColor: "#007bff",
            font: { family: "Helvetica-Bold" }
          },
          {
            text: "Answer",
            align: "center",
            textColor: "#007bff",
            font: { family: "Helvetica-Bold" }
          },
          {
            text: "Issue Status",
            align: "center",
            textColor: "#007bff",
            font: { family: "Helvetica-Bold" }
          }
        ],
        [
          {
            text: "Interior",
            colSpan: 3,
            align: "center",
            textColor: "#007bff"
          }
        ],
        ...getAnswersTableRows(check.interior),
        [
          {
            text: "Exterior",
            colSpan: 3,
            align: "center",
            textColor: "#007bff"
          }
        ],
        ...getAnswersTableRows(check.exterior)
      ]
    })

    pdfDoc.end()
  }
}
