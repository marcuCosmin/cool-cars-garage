import { type Request, type Response } from "express"

export const handleWappWebhookPostRequest = (req: Request, res: Response) => {
  console.log(req.body)

  res.status(200).end()
}
