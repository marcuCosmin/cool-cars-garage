export const sendWappMessage = async () => {
  await fetch("https://graph.facebook.com/v22.0/832911756563437/messages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WAPP_API_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "+447387267400",
      type: "template",
      template: {
        name: "hello_world",
        language: {
          code: "en_US"
        }
      }
    })
  })
}
