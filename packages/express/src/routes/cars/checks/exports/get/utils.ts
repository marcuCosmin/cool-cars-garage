import PDFDocument from "pdfkit"

import { parseTimestampForDisplay } from "@/shared/utils/parseTimestampForDisplay"
import { capitalize } from "@/shared/utils/capitalize"

import type {
  CheckAnswer,
  CheckDoc,
  FaultDoc,
  IncidentDoc,
  UserDoc
} from "@/shared/firestore/firestore.model"

// eslint-disable-next-line no-undef
type CellOptions = PDFKit.Mixins.CellOptions

const getTableHeaderRow = (): CellOptions[] => {
  const columns = ["Question", "Answer", "Issue Status"]

  return columns.map(column => ({
    text: column,
    align: "center",
    textColor: "#007bff"
  }))
}

const getAnswersSectionTitleRow = (text: string): CellOptions[] => [
  {
    text,
    colSpan: 3,
    align: "center",
    textColor: "#007bff"
  }
]

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

type GetAnswersSectionTableRowsProps = {
  section: CheckAnswer[]
  faults: FaultDoc[]
}
const getAnswersSectionTableRows = ({
  section,
  faults
}: GetAnswersSectionTableRowsProps): CellOptions[][] =>
  section.map(({ label, value }) => {
    const fault = faults.find(({ description }) => description === label)
    const columns = [
      label,
      value ? "Passed" : "Failed",
      getDisplayedFaultStatus(fault)
    ]

    return columns.map(column => ({
      text: column,
      align: "center",
      font: { size: 10 }
    }))
  })

type BuildIndividualPDFDocProps = {
  check: CheckDoc
  driver: UserDoc
  faults: FaultDoc[]
  incidents: IncidentDoc[]
}

export const buildIndividualPDFDoc = ({
  check,
  driver,
  faults,
  incidents
}: BuildIndividualPDFDocProps) => {
  const gap = 0.5
  const margin = 25
  const primaryColor = "#007bff"
  const font = "Helvetica"
  const fontBold = "Helvetica-Bold"

  const { interior, exterior, carId, creationTimestamp, odoReading } = check

  const pdfDoc = new PDFDocument({
    margin
  })

  pdfDoc.fillColor(primaryColor)
  pdfDoc.font(fontBold)

  pdfDoc.fontSize(10).text("COOL CARS SOUTH COAST LIMITED")
  pdfDoc.moveDown(gap * 2)

  pdfDoc.fontSize(18).text(`Check Report - ${carId}`, { align: "center" })
  pdfDoc.moveDown(gap)

  pdfDoc.fontSize(13)

  pdfDoc.text(parseTimestampForDisplay(creationTimestamp), {
    align: "center"
  })
  pdfDoc.moveDown(gap)

  pdfDoc.text(`Reported by: ${driver.firstName} ${driver.lastName}`, {
    align: "center"
  })
  pdfDoc.moveDown(gap)

  pdfDoc.text(`Odometer reading: ${odoReading.value}${odoReading.unit}`, {
    align: "center"
  })

  pdfDoc.moveDown(gap * 2)

  pdfDoc.text("Questions", { align: "center" })
  pdfDoc.moveDown(gap)

  pdfDoc.font(font)

  pdfDoc.table({
    columnStyles: ["*", 75, 75],
    defaultStyle: { border: 0.5, borderColor: primaryColor, padding: 5 },
    data: [
      getTableHeaderRow(),
      getAnswersSectionTitleRow("Interior"),
      ...getAnswersSectionTableRows({ section: interior, faults }),
      getAnswersSectionTitleRow("Exterior"),
      ...getAnswersSectionTableRows({ section: exterior, faults })
    ]
  })

  pdfDoc.moveDown(gap * 2)

  pdfDoc.fillColor(primaryColor)
  pdfDoc.font(fontBold)

  if (incidents.length) {
    pdfDoc.text("Incidents", { align: "center" })

    const initialX = pdfDoc.x

    incidents.forEach(
      ({ creationTimestamp, description, resolutionTimestamp, status }) => {
        const descriptionHeight = pdfDoc.heightOfString(description, {
          align: "center"
        })
        const estimatedHeaderHeight = 60

        const contentHeight =
          pdfDoc.y + descriptionHeight + estimatedHeaderHeight
        const isOverflowing = contentHeight > pdfDoc.page.height - margin

        if (isOverflowing) {
          pdfDoc.addPage()
        }

        const initialY = pdfDoc.y

        pdfDoc.fillColor(primaryColor)
        pdfDoc.font(fontBold).fontSize(10)
        pdfDoc.moveDown(gap * 2)

        pdfDoc.text(
          `Report time: ${parseTimestampForDisplay(creationTimestamp)}`,
          { align: "center" }
        )
        pdfDoc.text(`Issue status: ${capitalize(status)}`, { align: "center" })

        if (resolutionTimestamp) {
          pdfDoc.text(
            `Resolution time: ${parseTimestampForDisplay(resolutionTimestamp)}`,
            { align: "center" }
          )
        }

        pdfDoc.moveDown(gap)

        pdfDoc
          .strokeColor(primaryColor)
          .lineWidth(0.5)
          .moveTo(pdfDoc.x + margin, pdfDoc.y)
          .lineTo(pdfDoc.page.width - margin * 2, pdfDoc.y)
          .stroke()

        pdfDoc.moveDown(gap * 2)

        pdfDoc
          .fillColor("black")
          .font(font)
          .fontSize(10)
          .text(description, { align: "center" })

        pdfDoc
          .rect(
            initialX,
            initialY,
            pdfDoc.page.width - margin * 2,
            pdfDoc.y - initialY + pdfDoc.currentLineHeight()
          )
          .stroke(primaryColor)

        pdfDoc.moveDown(gap * 4)
      }
    )
  }

  return pdfDoc
}
