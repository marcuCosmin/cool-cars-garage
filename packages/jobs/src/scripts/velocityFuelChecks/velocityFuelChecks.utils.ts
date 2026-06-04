type VelocityFuelDataResponse = {
  results: {
    obscured_pan: string
    gross_amount: string
    quantity: string
    site_address: string
  }[]
}

// Thursday and Jan 4 are fixed reference points required by the ISO 8601 week standard
export const getCurrentIsoWeek = () => {
  const currentDate = new Date()
  const currentDayOfWeek = currentDate.getDay()

  const daysUntilThursday = 4 - (currentDayOfWeek || 7)
  const thursday = new Date(currentDate)
  thursday.setDate(currentDate.getDate() + daysUntilThursday)
  thursday.setHours(0, 0, 0, 0)

  const isoYear = thursday.getFullYear()

  const jan4OfIsoYear = new Date(isoYear, 0, 4)
  const jan4DayOfWeek = jan4OfIsoYear.getDay()
  const week1Monday = new Date(jan4OfIsoYear)
  week1Monday.setDate(jan4OfIsoYear.getDate() - (jan4DayOfWeek || 7) + 1)

  const millisecondsSinceWeek1 = thursday.getTime() - week1Monday.getTime()
  const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000
  const weekNumber = Math.round(millisecondsSinceWeek1 / millisecondsPerWeek) + 1

  return `${isoYear}${String(weekNumber).padStart(2, "0")}`
}

type GetVelocityFuelDataProps = {
  accessToken: string
  isoWeek: string
}

export const getVelocityFuelData = async ({
  accessToken,
  isoWeek
}: GetVelocityFuelDataProps) => {
  try {
    const url = new URL(
      "https://www.velocityfleet.com/vapi/v1/fuel/transactions"
    )
    url.searchParams.set("iso_week", isoWeek)

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Error ${response.status}: ${text}`)
    }

    const { results } = (await response.json()) as VelocityFuelDataResponse
    const formattedResults = results.map(
      ({ obscured_pan, gross_amount, quantity, site_address, ...result }) => {
        const cost = parseFloat(gross_amount)

        if (isNaN(cost)) {
          console.warn(
            `Unable to parse cost from gross_amount: ${gross_amount}`,
            result
          )
        }
        return {
          cardNumber: obscured_pan,
          cost: parseFloat(gross_amount),
          quantity: parseFloat(quantity),
          siteAddress: site_address
        }
      }
    )

    return formattedResults
  } catch (error) {
    console.error("Error fetching Velocity Fuel data:", error)
  }
}
