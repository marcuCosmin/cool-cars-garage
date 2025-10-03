export type MissingCheckTemplate = {
  type: "missing_check"
  params: {
    driver_name: string
    car_reg_number: string
  }
}

type FaultsSubmittedTemplate = {
  type: "faults_reported"
  params: {
    driver_name: string
    faults_count: string
    car_reg_number: string
  }
  check_id: string
}

type IncidentSubmittedTemplate = {
  type: "incident_submitted"
  params: {
    driver_name: string
    car_reg_number: string
  }
  check_id: string
}

type SendWappMessageProps = {
  template:
    | MissingCheckTemplate
    | FaultsSubmittedTemplate
    | IncidentSubmittedTemplate
  phoneNumber: string
}

const getBodyComponent = (template: SendWappMessageProps["template"]) => {
  const componentsBodyParams = Object.entries(template.params).map(
    ([key, value]) => ({
      type: "text",
      parameter_name: key,
      text: value
    })
  )

  return {
    type: "body",
    parameters: componentsBodyParams
  }
}

const getURLComponent = (template: SendWappMessageProps["template"]) => {
  if (
    template.type !== "faults_reported" &&
    template.type !== "incident_submitted"
  ) {
    return null
  }

  return {
    type: "button",
    sub_type: "url",
    index: "0",
    parameters: [
      {
        type: "text",
        text: template.check_id
      }
    ]
  }
}

const sendWappMessage = async ({
  phoneNumber,
  template
}: SendWappMessageProps) => {
  const bodyComponent = getBodyComponent(template)
  const urlComponent = getURLComponent(template)

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
        template: {
          name: template.type,
          language: {
            code: "en"
          },
          components: [bodyComponent, urlComponent]
        }
      })
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.log(data)
    throw new Error(data.message)
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
