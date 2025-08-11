import { Router } from "express"
import cors from "cors"

import { updateCheckPointDate } from "./services/update-checkpoint-date"
import { handleIncidentSubmission } from "./services/submit-incident"
import { handleCheckSubmission } from "./services/submit-check"
import { firestore } from "../../firebase/config"
import { Timestamp } from "firebase-admin/firestore"
import puppeteer from "puppeteer"

export const carsRouter = Router()

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
  const { carsIds, startDate, endDate, reportType } = req.body

  const toTimestamp = (date?: Timestamp) => {
    if (!date) {
      return
    }
    return new Timestamp(date.seconds, date.nanoseconds)
  }

  const start = toTimestamp(startDate)
  const end = toTimestamp(endDate)

  const isChecksReport = reportType === "Checks"

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

  if (!isChecksReport) {
    carsRef = carsRef.where("fault", "!=", null)
  }

  const carsSnapshot = await carsRef.get()

  const carsData = carsSnapshot.docs.map(doc => doc.data()) as Report[]

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  if (isChecksReport) {
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
  } else {
    const defects: {
      description: string
      status: "pending" | "resolved"
      resolvedAt?: Timestamp
      vehicleRegNumber: string
      timestamp: Timestamp
      driverName: string
    }[] = []

    carsData.forEach(car => {
      car.fault?.forEach(f => {
        defects.push({
          description: f.description,
          status: f.status,
          vehicleRegNumber: car.vehicleRegNumber,
          timestamp: car.timestamp,
          driverName: car.driverName,
          resolvedAt: f.resolvedAt
        })
      })
    })

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
          <h1>Vehicle Defect Report</h1>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Status</th>
                <th>Vehicle Registration</th>
                <th>Date and Time</th>
                <th>Driver</th>
                <th>Resolved at</th>
              </tr>
            </thead>
            <tbody>
            ${defects
              .map(
                defect => `
                <tr>
                  <td>${defect.description}</td>
                  <td>${defect.status}</td>
                  <td>${defect.vehicleRegNumber}</td>
                  <td>${defect.timestamp.toDate().toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</td>
                  <td>${defect.driverName}</td>
                  <td>${
                    defect.resolvedAt?.toDate().toLocaleString(undefined, {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) || "Not resolved"
                  }</td>
                </tr>
              `
              )
              .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `)
  }

  const pdfBuffer = await page.pdf()

  await browser.close()

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=report.pdf",
    "Content-Length": pdfBuffer.length
  })

  res.write(pdfBuffer)
})
