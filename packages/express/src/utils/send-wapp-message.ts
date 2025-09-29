type MissingCheckTemplate = {
  type: "missing_check"
  params: {
    driver_name: string
    car_reg_number: string
  }
}

type SendWappMessageProps = {
  template: MissingCheckTemplate
  to: string
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
      code: "en_US"
    },
    components: [
      {
        type: "body",
        parameters: componentsBodyParams
      }
    ]
  }
}

export const sendWappMessage = async ({
  to,
  template
}: SendWappMessageProps) => {
  const bodyTemplate = getBodyTemplate(template)

  await fetch("https://graph.facebook.com/v22.0/832911756563437/messages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WAPP_API_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: bodyTemplate
    })
  })
}
