import { type Request, type Response } from "express"

export const handleWappWebhookPostRequest = (req: Request, res: Response) => {
  console.log(JSON.stringify(req.body, null, 2))
  res.status(200).end()
}
