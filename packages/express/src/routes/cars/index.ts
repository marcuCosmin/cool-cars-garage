import { Router } from "express"
import cors from "cors"

import { updateCheckPointDate } from "./services/update-checkpoint-date"
import { handleIncidentSubmission } from "./services/submit-incident"
import { handleCheckSubmission } from "./services/submit-check"
import { firestore } from "../../firebase/config"
import { Timestamp } from "firebase-admin/firestore"
import puppeteer from "puppeteer"

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
  const { carsIds, startDate, endDate, reportId } = req.body

  const toTimestamp = (date?: Timestamp) => {
    if (!date) {
      return
    }
    return new Timestamp(date.seconds, date.nanoseconds)
  }

  const start = toTimestamp(startDate)
  const end = toTimestamp(endDate)

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

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

    const tableInterior = interior
      .map((question, index) => {
        const fault = reportData!.fault?.find(
          f => f.questionIndex === index && f.questionCategory === "interior"
        )
        return `
        <tr>
          <td>Interior</td>
          <td>${question.label}</td>
          <td>${fault ? fault.status : "passed"}</td>
        </tr>
      `
      })
      .join("")

    const tableExterior = exterior
      .map((question, index) => {
        const fault = reportData!.fault?.find(
          f => f.questionIndex === index && f.questionCategory === "exterior"
        )
        return `
        <tr>
          <td>Exterior</td>
          <td>${question.label}</td>
          <td>${fault ? fault.status : "passed"}</td>
        </tr>
      `
      })
      .join("")

    await page.setContent(`<html>
      <head>
        <title>Report</title>
        <style>
          h1 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: center;
          }
          th {
            background-color: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <p>Cool Cars South Coast Ltd.</p>
        <h1>${reportData.vehicleRegNumber} ${reportData.driverName} ${reportData.timestamp
          .toDate()
          .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          })}</h1>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Question</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableInterior}
            ${tableExterior}
          </tbody>
        </table>
      </body>
    </html>`)

    const pdfBuffer = await page.pdf()

    console.log(pdfBuffer.length)

    await browser.close()

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=report.pdf",
      "Content-Length": pdfBuffer.length
    })

    res.write(pdfBuffer)
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

  await page.setContent(`
    <html>
      <head>
        <title>Cool Cars South Coast Ltd.</title>
        <style>
          h1 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: center;
          }
          th {
            background-color: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <p>Cool Cars South Coast Ltd.</p>
        <h1>Vehicle Check Report</h1>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Vehicle Registration</th>
              <th>Date and Time</th>
              <th>Driver</th>
              <th>Odometer reading</th>
              <th>Faults</th>
            </tr>
          </thead>
          <tbody>
          ${carsData
            .map(
              car => `
              <tr>
                <td>${car.fault?.some(f => f.status === "pending") ? "Defects found" : "Passed"}</td>
                <td>${car.vehicleRegNumber}</td>
                <td>${car.timestamp.toDate().toLocaleString(undefined, {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                })}</td>
                <td>${car.driverName}</td>
                <td>${car.odoReading || 143432423}</td>
                <td>${car.fault?.length || 0}</td>
              </tr>
            `
            )
            .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `)

  const pdfBuffer = await page.pdf()

  await browser.close()

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=report.pdf",
    "Content-Length": pdfBuffer.length
  })

  res.write(pdfBuffer)
})
