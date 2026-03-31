import { type Request, type Response } from "express"

export const handleWappWebhookPostRequest = (req: Request, res: Response) => {
  res.status(200).end()
}
