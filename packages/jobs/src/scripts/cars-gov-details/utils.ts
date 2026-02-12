// type VehicleEnquiryResponse =  {
//   "artEndDate": "2025-02-28",
//   "co2Emissions" : 135,
//   "colour" : "BLUE",
//   "engineCapacity": 2494,
//   "fuelType" : "PETROL",
//   "make" : "ROVER",
//   "markedForExport" : false,
//   "monthOfFirstRegistration" : "2004-12",
//   "motStatus" : "No details held by DVLA",
//   "registrationNumber" : "ABC1234",
//   "revenueWeight" : 1640,
//   "taxDueDate" : "2007-01-01",
//   "taxStatus" : "Untaxed",
//   "typeApproval" : "N1",
//   "wheelplan" : "NON STANDARD",
//   "yearOfManufacture" : 2004,
//   "euroStatus": "EURO 6 AD",
//   "realDrivingEmissions": "1",
//   "dateOfLastV5CIssued": "2016-12-25"
// }
type VehicleEnquiryResponse = {
  make: string
  artEndDate: "2025-02-28"
  co2Emissions: number
  colour: string
  engineCapacity: number
  fuelType: "PETROL"
  markedForExport: false
  monthOfFirstRegistration: "2004-12"
  motStatus: "No details held by DVLA"
  registrationNumber: "ABC1234"
  revenueWeight: 1640
  taxDueDate: "2007-01-01"
  taxStatus: "Untaxed"
  typeApproval: "N1"
  wheelplan: "NON STANDARD"
  yearOfManufacture: 2004
  euroStatus: "EURO 6 AD"
  realDrivingEmissions: "1"
  dateOfLastV5CIssued: "2016-12-25"
}

export const getCarDetails = async (carId: string) => {
  const response = await fetch(
    "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
    {
      method: "POST",
      headers: {
        "x-api-key": process.env.VEHICLE_ENQUIRY_API_KEY!,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        registrationNumber: carId
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch ${carId}: ${response.statusText}`)
  }

  const result = await response.json()

  return result
}
