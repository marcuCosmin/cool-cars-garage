import express from "express"

import { usersRouter } from "./routes/users"
import { mailRouter } from "./routes/mail"
import { carsRouter } from "./routes/cars"
import { wappWebhook } from "./routes/wapp-webhook"

import { authorizationMiddleware } from "@/middlewares/authorization-middleware"
import { errorMiddleware } from "@/middlewares/error-middleware"
import { sendWappMessage } from "./utils/send-wapp-message"

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(authorizationMiddleware)
app.use(errorMiddleware)

app.use("/users", usersRouter)
app.use("/cars", carsRouter)
app.use("/mail", mailRouter)
app.use("/wapp-webhook", wappWebhook)

app.get("/", async (req, res) => {
  await sendWappMessage({
    to: "+40743100368",
    template: {
      type: "missing_check",
      params: {
        driver_name: "Marcus",
        car_reg_number: "AB12CDE"
      }
    }
  })

  res.send("Cool Cars Garage API is running!")
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
