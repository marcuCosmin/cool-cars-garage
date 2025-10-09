import PDFDocument from "pdfkit"

import { parseTimestampForDisplay } from "@/shared/utils/parseTimestampForDisplay"
import { capitalize } from "@/shared/utils/capitalize"

import type {
  CheckAnswer,
  CheckDoc,
  FaultDoc,
  FullCheck,
  IncidentDoc,
  UserDoc
} from "@/shared/firestore/firestore.model"

const pdfGap = 0.5
const pdfMargin = 25
const pdfPrimaryColor = "#007bff"
const pdfFont = "Helvetica"
const pdfFontBold = "Helvetica-Bold"

// eslint-disable-next-line no-undef
type CellOptions = PDFKit.Mixins.CellOptions

const getTableHeaderRow = (columns: string[]): CellOptions[] =>
  columns.map(column => ({
    text: column,
    align: "center",
    textColor: pdfPrimaryColor
  }))

const getAnswersSectionTitleRow = (text: string): CellOptions[] => [
  {
    text,
    colSpan: 3,
    align: "center",
    textColor: pdfPrimaryColor
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
  const {
    interior,
    exterior,
    carId,
    creationTimestamp,
    odoReading,
    faultsDetails
  } = check

  const pdfDoc = new PDFDocument({
    margin: pdfMargin
  })

  pdfDoc.fillColor(pdfPrimaryColor)
  pdfDoc.font(pdfFontBold)

  pdfDoc.fontSize(10).text("COOL CARS SOUTH COAST LIMITED")
  pdfDoc.moveDown(pdfGap * 2)

  pdfDoc.fontSize(18).text(`Check Report - ${carId}`, { align: "center" })
  pdfDoc.moveDown(pdfGap)

  pdfDoc.fontSize(13)

  pdfDoc.text(parseTimestampForDisplay(creationTimestamp), {
    align: "center"
  })
  pdfDoc.moveDown(pdfGap)

  pdfDoc.text(`Reported by: ${driver.firstName} ${driver.lastName}`, {
    align: "center"
  })
  pdfDoc.moveDown(pdfGap)

  pdfDoc.text(`Odometer reading: ${odoReading.value} ${odoReading.unit}`, {
    align: "center"
  })

  pdfDoc.moveDown(pdfGap * 2)

  pdfDoc.text("Questions", { align: "center" })
  pdfDoc.moveDown(pdfGap)

  pdfDoc.font(pdfFont)

  pdfDoc.table({
    columnStyles: ["*", 75, 75],
    defaultStyle: { border: 0.5, borderColor: pdfPrimaryColor, padding: 5 },
    data: [
      getTableHeaderRow(["Question", "Answer", "Issue Status"]),
      getAnswersSectionTitleRow("Interior"),
      ...getAnswersSectionTableRows({ section: interior, faults }),
      getAnswersSectionTitleRow("Exterior"),
      ...getAnswersSectionTableRows({ section: exterior, faults })
    ]
  })

  if (faultsDetails) {
    pdfDoc.moveDown(pdfGap * 2)

    const headingHeight = pdfDoc.heightOfString("Faults Details", {
      align: "center"
    })
    const contentHeight =
      pdfDoc.y +
      pdfDoc.heightOfString(faultsDetails, {
        align: "center"
      })

    const isOverflowing =
      contentHeight + headingHeight + pdfGap * 2 >
      pdfDoc.page.height - pdfMargin

    if (isOverflowing) {
      pdfDoc.addPage()
    }

    const borderY = pdfDoc.y

    pdfDoc.moveDown(pdfGap)

    pdfDoc.fillColor(pdfPrimaryColor)
    pdfDoc.text("Faults Details", { align: "center" })
    pdfDoc.moveDown(pdfGap)

    pdfDoc.fillColor("black")
    pdfDoc.fontSize(10)

    pdfDoc.text(faultsDetails, { align: "center" })

    pdfDoc
      .rect(
        pdfDoc.x,
        borderY,
        pdfDoc.page.width - pdfMargin * 2,
        pdfDoc.y - borderY + pdfDoc.currentLineHeight()
      )
      .lineWidth(0.5)
      .stroke(pdfPrimaryColor)
  }

  if (incidents.length) {
    pdfDoc.moveDown(pdfGap * 2)

    pdfDoc.fillColor(pdfPrimaryColor)
    pdfDoc.font(pdfFontBold)

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
        const isOverflowing = contentHeight > pdfDoc.page.height - pdfMargin

        if (isOverflowing) {
          pdfDoc.addPage()
        }

        const initialY = pdfDoc.y

        pdfDoc.fillColor(pdfPrimaryColor)
        pdfDoc.font(pdfFontBold).fontSize(10)
        pdfDoc.moveDown(pdfGap * 2)

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

        pdfDoc.moveDown(pdfGap)

        pdfDoc
          .strokeColor(pdfPrimaryColor)
          .lineWidth(0.5)
          .moveTo(pdfDoc.x + pdfMargin, pdfDoc.y)
          .lineTo(pdfDoc.page.width - pdfMargin * 2, pdfDoc.y)
          .stroke()

        pdfDoc.moveDown(pdfGap * 2)

        pdfDoc
          .fillColor("black")
          .font(pdfFont)
          .fontSize(10)
          .text(description, { align: "center" })

        pdfDoc
          .rect(
            initialX,
            initialY,
            pdfDoc.page.width - pdfMargin * 2,
            pdfDoc.y - initialY + pdfDoc.currentLineHeight()
          )
          .stroke(pdfPrimaryColor)

        pdfDoc.moveDown(pdfGap * 4)
      }
    )
  }

  return pdfDoc
}

type BuildBulkPDFDocProps = {
  checks: Omit<FullCheck, "incidents" | "faults">[]
  startTimestamp: number
  endTimestamp: number
}

export const buildBulkPDFDoc = ({
  checks,
  startTimestamp,
  endTimestamp
}: BuildBulkPDFDocProps) => {
  const tableBodyRows = checks.map(
    ({
      carId,
      creationTimestamp,
      driver,
      odoReading,
      faultsCount,
      incidentsCount,
      hasUnresolvedFaults,
      hasUnresolvedIncidents
    }) => {
      const cellsText = [
        carId,
        parseTimestampForDisplay(creationTimestamp),
        `${driver.firstName} ${driver.lastName}`,
        `${odoReading.value} ${odoReading.unit}`,
        faultsCount ?? 0,
        incidentsCount ?? 0,
        hasUnresolvedFaults || hasUnresolvedIncidents ? "PENDING" : "PASSED"
      ]

      return cellsText.map(text => ({
        text,
        align: "center",
        font: { size: 10 }
      })) as CellOptions[]
    }
  )
  const pdfDoc = new PDFDocument({ margin: pdfMargin })

  pdfDoc.fillColor(pdfPrimaryColor)
  pdfDoc.font(pdfFontBold)

  pdfDoc.fontSize(10).text("COOL CARS SOUTH COAST LIMITED")
  pdfDoc.moveDown(pdfGap * 2)

  pdfDoc.fontSize(18).text(`Vehicles Checks Report`, { align: "center" })
  pdfDoc.moveDown(pdfGap)
  pdfDoc.text(
    `${parseTimestampForDisplay(startTimestamp)} - ${parseTimestampForDisplay(endTimestamp)}`,
    { align: "center" }
  )
  pdfDoc.moveDown(pdfGap * 2)

  pdfDoc.font(pdfFont)
  pdfDoc.fontSize(13)

  pdfDoc.table({
    columnStyles: ["*", "*", "*", "*", 75, 75, "*"],
    defaultStyle: { border: 0.5, borderColor: pdfPrimaryColor, padding: 5 },
    data: [
      getTableHeaderRow([
        "Vehicle registration",
        "Date & Time",
        "Driver",
        "Odometer reading",
        "Faults",
        "Incidents",
        "Status"
      ]),
      ...tableBodyRows
    ]
  })

  return pdfDoc
}
