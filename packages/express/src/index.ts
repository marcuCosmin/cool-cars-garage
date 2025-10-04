import express from "express"

import { usersRouter } from "./routes/users"
import { mailRouter } from "./routes/mail"
import { carsRouter } from "./routes/cars"
import { wappWebhook } from "./routes/wapp-webhook"

import { authorizationMiddleware } from "@/middlewares/authorization-middleware"
import { errorMiddleware } from "@/middlewares/error-middleware"

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(authorizationMiddleware)
app.use(errorMiddleware)

app.use("/users", usersRouter)
app.use("/cars", carsRouter)
app.use("/mail", mailRouter)
app.use("/wapp-webhook", wappWebhook)

app.get("/", (req, res) => {
  res.send("Cool Cars Garage API is running!")
})

app.listen(port, () => {
  console.log(`[express]: Server is running at http://localhost:${port}`)
})
