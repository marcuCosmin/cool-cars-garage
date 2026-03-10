type VelocityFuelDataResponse = {
  results: {
    obscured_pan: string
    gross_amount: string
    quantity: string
    site_address: string
  }[]
}

export const getVelocityFuelData = async (accessToken: string) => {
  try {
    const response = await fetch(
      "https://www.velocityfleet.com/vapi/v1/fuel/transactions",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

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
