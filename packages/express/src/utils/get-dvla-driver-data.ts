import { getSecretValue } from "@/backend/utils/get-secret-value"

import type { DriverDVLAData } from "@/globals/firestore/firestore.model"

const getTimestampFromDVLADate = (dvlaDate: string) => {
  const [year, month, day] = dvlaDate.split("-").map(Number)

  const date = new Date(year, month - 1, day)

  return date.getTime()
}

type DVLARestriction = {
  restrictionCode: string
  restrictionLiteral: string
}

type DVLAEntitlement = {
  categoryCode: string
  categoryLegalLiteral: string
  categoryType: "Full" | "Provisional"
  fromDate: string
  expiryDate: string
  restrictions?: DVLARestriction[]
}

type DVLAEndorsement = {
  penaltyPoints?: number
}

type DVLACPC = Partial<{
  lgvValidTo: string
  pcvValidTo: string
  national: boolean
}>

type DVLATachoCard = {
  cardNumber: string
  cardStatus: "DISPATCHED"
  cardExpiryDate: string
  cardStartOfValidityDate: string
}

type DVLAResponse = {
  driver: {
    drivingLicenceNumber: string
    firstNames: string
    lastName: string
    dateOfBirth: string
  }
  licence: {
    type: "Full" | "Provisional"
    status: "Valid" | "Disqualified"
  }
  entitlement: DVLAEntitlement[]
  endorsements: DVLAEndorsement[]
  cpc?: { cpcs: DVLACPC[] }
  holder?: {
    tachoCards: DVLATachoCard[]
  }
}

type GetDVLADriverDataProps = {
  jwt: string
  drivingLicenceNumber: string
}
export const getDVLADriverData = async ({
  jwt,
  drivingLicenceNumber
}: GetDVLADriverDataProps): Promise<DriverDVLAData> => {
  const dvlaApiKey = await getSecretValue("DVLA_API_KEY")

  const response = await fetch(
    `${process.env.DVLA_API_URL}/full-driver-enquiry/v1/driving-licences/retrieve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": jwt,
        "X-Api-Key": dvlaApiKey
      },
      body: JSON.stringify({
        drivingLicenceNumber,
        includeCPC: true,
        includeTacho: true,
        acceptPartialResponse: "false"
      })
    }
  )

  const data = (await response.json()) as DVLAResponse

  const { driver, licence, entitlement, endorsements, cpc, holder } = data

  const penaltyPoints = endorsements.reduce((total, endorsement) => {
    return total + (endorsement.penaltyPoints || 0)
  }, 0)

  return {
    drivingLicenceNumber: driver.drivingLicenceNumber,
    birthTimestamp: getTimestampFromDVLADate(driver.dateOfBirth),
    lastName: driver.lastName,
    firstName: driver.firstNames,
    penaltyPoints,
    cpcs:
      cpc?.cpcs.map(({ lgvValidTo, pcvValidTo }) => {
        const cpc: DriverDVLAData["cpcs"][number] = {}

        if (lgvValidTo) {
          cpc.lgvExpiryTimestamp = getTimestampFromDVLADate(lgvValidTo)
        }

        if (pcvValidTo) {
          cpc.pcvExpiryTimestamp = getTimestampFromDVLADate(pcvValidTo)
        }

        return cpc
      }) || [],
    tachoCards:
      holder?.tachoCards.map(({ cardNumber, cardExpiryDate }) => ({
        cardNumber,
        cardExpiryTimestamp: getTimestampFromDVLADate(cardExpiryDate)
      })) || [],
    licenceType: licence.type,
    licenceStatus: licence.status,
    entitlements: entitlement.map(
      ({
        categoryCode,
        categoryLegalLiteral,
        categoryType,
        fromDate,
        expiryDate
      }) => ({
        categoryCode,
        categoryLegalLiteral,
        categoryType,
        activationTimestamp: getTimestampFromDVLADate(fromDate),
        expiryTimestamp: getTimestampFromDVLADate(expiryDate)
      })
    )
  }
}
