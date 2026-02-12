import { parseDateToTimestamp } from "./parse-string-to-timestamp"

import type { CarDoc } from "../../globals/firestore/firestore.model"

type CarEnquiryResponse = {
  make: string
  artEndDate: string
  co2Emissions?: number
  colour: string
  engineCapacity: number
  fuelType: string
  markedForExport: boolean
  monthOfFirstRegistration: string
  motStatus:
    | "No details held by DVLA"
    | "No results returned"
    | "Not valid"
    | "Valid"
  registrationNumber: string
  revenueWeight: number
  taxDueDate: string
  taxStatus: "Not Taxed for on Road Use" | "SORN" | "Taxed" | "Untaxed"
  typeApproval: string
  wheelplan: string
  yearOfManufacture: number
  euroStatus: string
  realDrivingEmissions: string
  dateOfLastV5CIssued: string
}

type CarGovDetails = Pick<
  CarDoc,
  | "color"
  | "make"
  | "fuelType"
  | "engineCapacity"
  | "lastIssuedV5CTimestamp"
  | "co2Emissions"
  | "roadTaxStatus"
  | "roadTaxExpiryTimestamp"
>
export const getCarGovDetails = async (
  regNumber: string
): Promise<CarGovDetails | undefined> => {
  try {
    console.log(`Fetching details for ${regNumber} from DVLA...`)

    const response = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.VEHICLE_ENQUIRY_API_KEY!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          registrationNumber: regNumber
        })
      }
    )

    if (!response.ok) {
      console.log(
        `Failed to fetch details for ${regNumber} from DVLA: ${response.statusText}`
      )
      return
    }

    const result = (await response.json()) as CarEnquiryResponse

    const {
      colour,
      make,
      fuelType,
      engineCapacity,
      dateOfLastV5CIssued,
      co2Emissions,
      taxStatus,
      taxDueDate
    } = result

    console.log(`Successfully fetched details for ${regNumber} from DVLA`)

    const carDetils: CarGovDetails = {
      color: colour,
      make,
      fuelType,
      engineCapacity,
      roadTaxStatus: taxStatus,
      roadTaxExpiryTimestamp: parseDateToTimestamp(taxDueDate),
      lastIssuedV5CTimestamp: parseDateToTimestamp(dateOfLastV5CIssued)
    }

    if (co2Emissions) {
      carDetils.co2Emissions = co2Emissions
    }

    return carDetils
  } catch (error) {
    console.error(`Error fetching details for ${regNumber} from DVLA:`, error)
  }
}
