import { type Response } from "express"

import { getFirestoreDoc, getFirestoreDocs } from "@/firebase/utils"

import type { Request } from "@/models"

import type { CarsCheckExportURLQuery } from "@/shared/requests/requests.model"

import { buildBulkPDFDoc, buildIndividualPDFDoc } from "./utils"

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

  if (type === "individual") {
    const { checkId } = req.query

    if (!checkId || typeof checkId !== "string") {
      res.status(400).json({ error: "Missing or invalid checkId parameter" })
      return
    }

    const check = await getFirestoreDoc({
      collection: "checks",
      docId: checkId
    })

    if (!check) {
      res.status(404).json({ error: "Check not found" })
      return
    }

    const driver = await getFirestoreDoc({
      collection: "users",
      docId: check.driverId
    })

    if (!driver) {
      res.status(404).json({ error: "Driver not found" })
      return
    }

    const faults = await getFirestoreDocs({
      collection: "faults",
      queries: [["checkId", "==", checkId]]
    })

    const incidents = await getFirestoreDocs({
      collection: "incidents",
      queries: [["checkId", "==", checkId]]
    })

    const pdfDoc = buildIndividualPDFDoc({
      check,
      driver,
      faults,
      incidents
    })

    pdfDoc.pipe(res)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", 'inline; filename="example.pdf"')

    pdfDoc.end()
    return
  }

  if (type === "bulk") {
    const startTimestamp = Number(req.query.startTimestamp)
    const endTimestamp = Number(req.query.endTimestamp)

    if (
      !startTimestamp ||
      !endTimestamp ||
      isNaN(startTimestamp) ||
      isNaN(endTimestamp)
    ) {
      res.status(400).json({
        error: "Missing or invalid startTimestamp or endTimestamp parameter"
      })
      return
    }

    const checksRawData = await getFirestoreDocs({
      collection: "checks",
      queries: [
        ["creationTimestamp", ">=", startTimestamp],
        ["creationTimestamp", "<=", endTimestamp]
      ]
    })

    if (!checksRawData.length) {
      res.status(404).json({ error: "No checks found in the given time range" })
      return
    }

    const driversIds = new Set(checksRawData.map(({ driverId }) => driverId))
    const drivers = await getFirestoreDocs({
      collection: "users",
      ids: Array.from(driversIds)
    })

    const checks = checksRawData.map(check => {
      const driver = drivers.find(driver => driver.id === check.driverId)!

      return {
        ...check,
        driver
      }
    })

    const pdfDoc = buildBulkPDFDoc({ checks, startTimestamp, endTimestamp })

    pdfDoc.pipe(res)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", 'inline; filename="example.pdf"')

    pdfDoc.end()

    return
  }

  res.status(400).json({ error: "Invalid or missing type parameter" })
}
