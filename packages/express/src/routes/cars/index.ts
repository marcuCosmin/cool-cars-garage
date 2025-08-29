import { Router } from "express"
import cors from "cors"

import { updateCheckPointDate } from "./services/update-checkpoint-date"
import { handleIncidentSubmission } from "./services/submit-incident"
import { handleCheckSubmission } from "./services/submit-check"
import { firestore } from "../../firebase/config"
import { Timestamp } from "firebase-admin/firestore"
import PDFDoc from "pdfkit"

export const carsRouter = Router()

type Question = {
  label: string
}
type QuestionDoc = {
  interior: Question[]
  exterior: Question[]
}

type Report = {
  id: string
  timestamp: Timestamp
  driverName: string
  vehicleRegNumber: string
  odoReading: number
  fault?: {
    description: string
    status: "pending" | "resolved"
    resolvedAt?: Timestamp
    questionIndex: number
    questionCategory: string
  }[]
}

carsRouter.options("/", cors({ origin: process.env.ALLOWED_ORIGIN }))
carsRouter.patch(
  "/",
  cors({ origin: process.env.ALLOWED_ORIGIN }),
  updateCheckPointDate
)

carsRouter.options("/incidents", cors())
carsRouter.post("/incidents", cors(), handleIncidentSubmission)

carsRouter.options("/checks", cors())
carsRouter.post("/checks", cors(), handleCheckSubmission)

carsRouter.options("/export", cors())
carsRouter.post("/export", cors(), async (req, res) => {
  try {
    const { carsIds, startDate, endDate, reportId } = req.body
    const pdfDoc = new PDFDoc()
    pdfDoc.pipe(res)
    pdfDoc.fontSize(11).text("Cool Cars South Coast Ltd.")
    pdfDoc.moveDown()

    const toTimestamp = (date?: Timestamp) => {
      if (!date) {
        return
      }
      return new Timestamp(date.seconds, date.nanoseconds)
    }

    const start = toTimestamp(startDate)
    const end = toTimestamp(endDate)

    if (reportId) {
      const reportRef = firestore.collection("demo").doc(reportId)
      const reportSnapshot = await reportRef.get()
      if (!reportSnapshot.exists) {
        res.status(404).send("Report not found")
        return
      }

      const reportData = reportSnapshot.data() as Report
      const questions = firestore.collection("reports-config").doc("questions")

      const questionsSnapshot = await questions.get()
      const questionsData = questionsSnapshot.data()

      const { interior, exterior } = questionsData as QuestionDoc

      pdfDoc.fontSize(16).text(
        `${reportData.vehicleRegNumber} ${reportData.driverName} ${reportData.timestamp
          .toDate()
          .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Europe/London"
          })}`,
        { align: "center" }
      )
      pdfDoc.moveDown()
      pdfDoc.fontSize(11)
      pdfDoc.text(`Odometer reading: ${reportData.odoReading} km`, {
        align: "center"
      })
      pdfDoc.moveDown()

      const table = pdfDoc.table({
        columnStyles: [100, "*", 100]
      })

      table.row([
        {
          text: "Category",
          align: "center",
          borderColor: "#f4f4f4"
        },
        {
          text: "Question",
          align: "center",
          borderColor: "#f4f4f4"
        },
        {
          text: "Status",
          align: "center",
          borderColor: "#f4f4f4"
        }
      ])

      interior.forEach((question, index) => {
        const fault = reportData!.fault?.find(
          f => f.questionIndex === index && f.questionCategory === "interior"
        )
        table.row([
          {
            text: "Interior",
            align: "center",
            borderColor: "#f4f4f4"
          },
          {
            text: question.label,
            align: "center",
            borderColor: "#f4f4f4",
            textOptions: {
              lineBreak: true
            }
          },
          {
            text: fault ? fault.status : "passed",
            align: "center",
            borderColor: "#f4f4f4"
          }
        ])
      })

      exterior.forEach((question, index) => {
        const fault = reportData!.fault?.find(
          f => f.questionIndex === index && f.questionCategory === "exterior"
        )
        table.row([
          {
            text: "Exterior",
            align: "center",
            borderColor: "#f4f4f4"
          },
          {
            text: question.label,
            align: "center",
            borderColor: "#f4f4f4"
          },
          {
            text: fault ? fault.status : "passed",
            align: "center",
            borderColor: "#f4f4f4"
          }
        ])
      })

      pdfDoc.end()
      return
    }

    let carsRef = firestore
      .collection("demo")
      .orderBy("timestamp", "desc")
      .where("vehicleRegNumber", "in", carsIds)

    if (start) {
      carsRef = carsRef.where("timestamp", ">=", start)
    }

    if (end) {
      carsRef = carsRef.where("timestamp", "<=", end)
    }

    const carsSnapshot = await carsRef.get()

    const carsData = carsSnapshot.docs.map(doc => doc.data()) as Report[]

    pdfDoc.fontSize(18).text("Vehicle Check Report", { align: "center" })
    pdfDoc.moveDown()

    const table = pdfDoc.table()
    pdfDoc.fontSize(11)
    table.row(
      [
        "Status",
        "Vehicle Registration",
        "Date and Time",
        "Driver",
        "Odometer reading",
        "Faults"
      ].map(value => ({ text: value, align: "center", borderColor: "#f4f4f4" }))
    )

    carsData.forEach(car => {
      table.row(
        [
          car.fault?.some(f => f.status === "pending")
            ? "Defects found"
            : "Passed",
          car.vehicleRegNumber,
          car.timestamp.toDate().toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Europe/London"
          }),
          car.driverName,
          car.odoReading.toString(),
          (car.fault?.length || 0).toString()
        ].map(value => ({
          text: value,
          align: "center",
          borderColor: "#f4f4f4"
        }))
      )
    })

    pdfDoc.end()
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})
