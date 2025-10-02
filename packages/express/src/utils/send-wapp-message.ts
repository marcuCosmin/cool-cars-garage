export type MissingCheckTemplate = {
  type: "missing_check"
  params: {
    driver_name: string
    car_reg_number: string
  }
}

type SendWappMessageProps = {
  template: MissingCheckTemplate
  phoneNumber: string
}

const getBodyTemplate = (template: SendWappMessageProps["template"]) => {
  const componentsBodyParams = Object.entries(template.params).map(
    ([key, value]) => ({
      type: "text",
      parameter_name: key,
      text: value
    })
  )

  return {
    name: template.type,
    language: {
      code: "en"
    },
    components: [
      {
        type: "body",
        parameters: componentsBodyParams
      }
    ]
  }
}

const sendWappMessage = async ({
  phoneNumber,
  template
}: SendWappMessageProps) => {
  const bodyTemplate = getBodyTemplate(template)

  const response = await fetch(
    "https://graph.facebook.com/v22.0/832911756563437/messages",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WAPP_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: bodyTemplate
      })
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data)
  }
}

type SendWappMessagesProps = Pick<SendWappMessageProps, "template"> & {
  phoneNumbers: string[]
}

export const sendWappMessages = async ({
  phoneNumbers,
  template
}: SendWappMessagesProps) => {
  const messagesPromises = phoneNumbers.map(phoneNumber =>
    sendWappMessage({
      phoneNumber,
      template
    })
  )

  await Promise.all(messagesPromises)
}
