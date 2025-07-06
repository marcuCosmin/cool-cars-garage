import express from "express"
import cors from "cors"

import { usersRouter } from "./routes/users"
import { mailRouter } from "./routes/mail"
import { carsRouter } from "./routes/cars"
import { reportsRouter } from "./routes/reports"

import { authorizationMiddleware } from "./utils/authorization-middleware"

const app = express()
const port = process.env.PORT
const allowedOrigin = process.env.ALLOWED_ORIGIN

app.use(express.json())
app.use(authorizationMiddleware)

//private
app.use("/reports", cors({ origin: "*" }), reportsRouter)
app.use("/users", cors({ origin: allowedOrigin }), usersRouter)
app.use("/cars", cors({ origin: allowedOrigin }), carsRouter)

//public
app.use("/mail", mailRouter)

app.get("/", (req, res) => {
  res.send("Cool Cars Garage API is running!")
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
