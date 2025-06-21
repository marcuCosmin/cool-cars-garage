import { type Request, type Response } from "express"

import { sendMail } from "../../../utils/send-mail"

type ReqBody = {
  email: string
  subject: string
  message: string
}

export const handlePostRequest = async (
  req: Request<object, undefined, ReqBody>,
  res: Response
) => {
  const { email, subject, message } = req.body

  try {
    await sendMail({
      to: email,
      subject,
      html: message
    })

    res.status(200).json({ message: "Message sent successfully" })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: error.message
      })

      return
    }

    res.status(500).json({ error: `An unexpected error occurred: ${error}` })
  }
}
