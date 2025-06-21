import nodemailer from "nodemailer"

type SendMailOptions = {
  to: string
  subject: string
  html: string
}

export const sendMail = async ({ to, subject, html }: SendMailOptions) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  })
}
