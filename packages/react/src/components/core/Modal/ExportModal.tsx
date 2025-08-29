import { carsUrl } from "@/api/config"
import { Form } from "@/components/basic/Form/Form"
import { Fields } from "@/components/basic/Form/Form.models"
import { firebaseAuth } from "@/firebase/config"
import { getRequiredError } from "@/utils/validations"
import { Timestamp } from "firebase/firestore"

type FormFields = {
  carsIds: string[]
  startDate?: Timestamp
  endDate?: Timestamp
}

const cars = [
  "HX15BXR",
  "NX16EBJ",
  "WX57NZH",
  "EA11PZO",
  "WL12EFX",
  "HX15KPT",
  "HK59PFZ"
]

const fields: Fields<FormFields> = {
  carsIds: {
    label: "Cars",
    options: cars,
    validator: getRequiredError,
    isMulti: true,
    defaultValue: cars,
    type: "select"
  },
  startDate: {
    label: "Start Date",
    type: "date"
  },
  endDate: {
    label: "End Date",
    type: "date"
  }
}

export const ExportModal = () => {
  const handleExport = async (data: FormFields) => {
    const idToken = await firebaseAuth.currentUser!.getIdToken()
    const response = await fetch(`${carsUrl}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify(data)
    })

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "checks_report.pdf"
    document.body.appendChild(a)
    a.click()
    a.remove()

    window.URL.revokeObjectURL(url)
  }

  return (
    <Form
      containerClassName="p-0 border-none sm:max-w-sm"
      title="Export Reports"
      submitLabel="Export"
      fields={fields}
      action={handleExport}
    />
  )
}
