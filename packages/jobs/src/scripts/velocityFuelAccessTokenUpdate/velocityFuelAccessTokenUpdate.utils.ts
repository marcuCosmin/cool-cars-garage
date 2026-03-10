export const getVelocityFuelAccessToken = async () => {
  try {
    const form = new FormData()
    form.append("token", process.env.VELOCITY_FUEL_REFRESH_TOKEN!)

    const response = await fetch(
      "https://www.velocityfleet.com/vapi/v1/accounts/users/oauth2/refresh/",
      {
        method: "POST",
        body: form
      }
    )

    if (!response.ok) {
      const text = await response.text()

      throw new Error(`Error ${response.status}: ${text}`)
    }

    const data = await response.json()

    return data.token
  } catch (error) {
    console.error("Error fetching Velocity Fuel access token:", error)
  }
}
