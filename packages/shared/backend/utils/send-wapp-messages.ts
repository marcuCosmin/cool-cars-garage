export type MissingCheckTemplate = {
  type: "missing_check"
  params: {
    driver_name: string
    car_reg_number: string
  }
}

type DriversBadgeExpirationTemplate = {
  type: "driver_badge_expiration"
  params: {
    driver_name: string
    expiration_date: string
  }
}

type CarsCheckpointsTemplate = {
  type: "cars_checkpoints"
  params: {
    car_reg_number: string
    expiry_date: string
    checkpoint: string
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
  type: "incident_reported"
  params: {
    driver_name: string
    car_reg_number: string
  }
  check_id: string
}

type UnresolvedDefectsTemplate = {
  type: "unresolved_defects"
  params: {
    faults_count: string
    incidents_count: string
  }
}

type OutstandingRecallFoundTemplate = {
  type: "outstanding_recall_found"
  params: {
    car_reg_number: string
  }
}

type OutstandingRecallFailedTemplate = {
  type: "outstanding_recall_failed"
  params: {
    car_reg_number: string
  }
}

type BulkOutstandingRecallFailedTemplate = {
  type: "outstanding_recalls_failed"
  params: {
    cars_reg_numbers: string
  }
}

type WhatsAppErrorResponse = {
  error: {
    message: string
    type: string
    code: number
    error_subcode?: number
    error_user_title?: string
    error_user_msg?: string
    fbtrace_id?: string
  }
}

type SendWappMessageProps = {
  template:
    | MissingCheckTemplate
    | FaultsSubmittedTemplate
    | IncidentSubmittedTemplate
    | UnresolvedDefectsTemplate
    | OutstandingRecallFoundTemplate
    | OutstandingRecallFailedTemplate
    | BulkOutstandingRecallFailedTemplate
    | CarsCheckpointsTemplate
    | DriversBadgeExpirationTemplate
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
    template.type !== "incident_reported"
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
  try {
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

    if (!response.ok) {
      const data = (await response.json()) as WhatsAppErrorResponse

      throw new Error(data.error.message)
    }
  } catch (error) {
    console.log(error)
  }
}

type SendWappMessagesProps = Pick<SendWappMessageProps, "template"> & {
  phoneNumbers: string[]
}

export const sendWappMessages = async ({
  phoneNumbers,
  template
}: SendWappMessagesProps) => {
  const results = await Promise.allSettled(
    phoneNumbers.map(phoneNumber =>
      sendWappMessage({
        phoneNumber,
        template
      })
    )
  )

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.log(
        `Failed to send "${template.type}" WhatsApp message to ${phoneNumbers[index]}`,
        result.reason
      )
    }
  })
}
