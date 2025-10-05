import { type Response } from "express"

import { getFirestoreDoc, getFirestoreDocs } from "@/firebase/utils"

import type { Request } from "@/models"

import type { CarsCheckExportURLQuery } from "@/shared/requests/requests.model"
import type {
  CheckDoc,
  FaultDoc,
  UserDoc
} from "@/shared/firestore/firestore.model"

import { buildIndividualPDFDoc } from "./utils"

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

    const check = await getFirestoreDoc<CheckDoc>({
      collection: "checks",
      docId: checkId
    })

    if (!check) {
      res.status(404).json({ error: "Check not found" })
      return
    }

    const driver = await getFirestoreDoc<UserDoc>({
      collection: "users",
      docId: check.driverId
    })

    if (!driver) {
      res.status(404).json({ error: "Driver not found" })
      return
    }

    const faults = await getFirestoreDocs<FaultDoc>({
      collection: "faults",
      queries: [["checkId", "==", checkId]]
    })

    const incidents = await getFirestoreDocs<FaultDoc>({
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
  }
}
