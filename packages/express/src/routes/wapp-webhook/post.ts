import { type Request, type Response } from "express"
import fs from "fs"

const logToFile = (message: string) => {
  fs.appendFile("output.txt", message + "\n", err => {
    if (err) {
      console.error("Error writing to file:", err)
    } else {
      console.log("Message saved to output.txt")
    }
  })
}

export const handleWappWebhookPostRequest = (req: Request, res: Response) => {
  logToFile(JSON.stringify(req.body))

  res.status(200).end()
}
