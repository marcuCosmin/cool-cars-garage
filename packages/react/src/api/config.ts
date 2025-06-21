const isProduction = process.env.NODE_ENV === "production"

const baseApiUrl = isProduction
  ? "https://api.cool-cars-garage.co.uk"
  : "http://localhost:3001"

export const usersUrl = `${baseApiUrl}/users`
