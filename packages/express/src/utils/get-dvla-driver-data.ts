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

type DVLACPC = {
  lgvValidTo: string
  pcvValidTo: string
  national: boolean
}

type DVLATachoCard = {
  cardNumber: string
  cardStatus: "DISPATCHED"
  cardExpiryDate: string
  cardStartOfValidityDate: string
}

type DriverDVLAData = {
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

export const getDVLADriverData = async (jwt: string) => {
  const response = await fetch(
    "https://uat.driver-vehicle-licensing.api.gov.uk/full-driver-enquiry/v1/driving-licences/retrieve",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": jwt,
        "X-Api-Key": process.env.DVLA_API_KEY as string
      },
      body: JSON.stringify({
        drivingLicenceNumber: "BTJMG803070FY9WJ",
        includeCPC: true,
        includeTacho: true,
        acceptPartialResponse: "false"
      })
    }
  )

  const { driver, licence, entitlement, endorsements, cpc, holder } =
    (await response.json()) as DriverDVLAData

  const penaltyPoints = endorsements.reduce((total, endorsement) => {
    return total + (endorsement.penaltyPoints || 0)
  }, 0)

  return {
    drivingLicenceNumber: driver.drivingLicenceNumber,
    birthTimestamp: getTimestampFromDVLADate(driver.dateOfBirth),
    lastName: driver.lastName,
    firstName: driver.firstNames,
    penaltyPoints,
    cpcs: cpc?.cpcs.map(({ lgvValidTo, pcvValidTo }) => ({
      lgvExpiryTimestamp: getTimestampFromDVLADate(lgvValidTo),
      pcvExpiryTimestamp: getTimestampFromDVLADate(pcvValidTo)
    })),
    tachoCards: holder?.tachoCards.map(({ cardNumber, cardExpiryDate }) => ({
      cardNumber,
      cardExpiryTimestamp: getTimestampFromDVLADate(cardExpiryDate)
    })),
    licence: {
      type: licence.type,
      status: licence.status
    },
    entitlements: entitlement.map(
      ({
        categoryCode,
        categoryLegalLiteral,
        categoryType,
        fromDate,
        expiryDate,
        restrictions
      }) => ({
        categoryCode,
        categoryLegalLiteral,
        categoryType,
        activationTimestamp: getTimestampFromDVLADate(fromDate),
        expiryTimestamp: getTimestampFromDVLADate(expiryDate),
        restrictions
      })
    )
  }
}
