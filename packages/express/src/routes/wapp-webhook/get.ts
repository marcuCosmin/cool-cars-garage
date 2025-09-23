import { type Request, type Response } from "express"

const verifyToken = process.env.WAPP_VERIFY_TOKEN

export const handleWappWebhookGetRequest = (req: Request, res: Response) => {
  const {
    "hub.mode": mode,
    "hub.challenge": challenge,
    "hub.verify_token": token
  } = req.query

  if (mode === "subscribe" && token === verifyToken) {
    res.status(200).send(challenge)
    return
  }

  res.status(403).end()
}
