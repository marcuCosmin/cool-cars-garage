import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type SendMailOptions = {
  to: string
  subject: string
  html: string
}

export const sendMail = async ({ to, subject, html }: SendMailOptions) => {
  const response = await resend.emails.send({
    from: "Cool Cars Garage <noreply@cool-cars-garage.co.uk>",
    to,
    subject,
    html
  })

  if (response.error) {
    throw response.error
  }
}
