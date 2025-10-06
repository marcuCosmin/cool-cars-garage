import { exportChecks } from "@/api/utils"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"
import { downloadBlob } from "@/utils/downloadBlob"

import {
  checksBulkExportFormFields,
  type ChecksBulkExportData
} from "@/shared/forms/forms.const"
import { parseTimestampForDisplay } from "@/shared/utils/parseTimestampForDisplay"

const formFields = extendFormFields({
  fieldsSchema: checksBulkExportFormFields,
  additionalFieldsProps: {
    startTimestamp: { label: "Start Date" },
    endTimestamp: { label: "End Date", includeEndOfDay: true }
  }
})

export const ChecksBulkExportModal = () => {
  const action = async (data: ChecksBulkExportData) => {
    const blob = await exportChecks({ ...data, type: "bulk" })

    downloadBlob({
      blob,
      fileName: `Vehicle Checks ${parseTimestampForDisplay(data.startTimestamp)} - ${parseTimestampForDisplay(data.endTimestamp)}.pdf`
    })
  }

  return (
    <Form
      containerClassName="p-0 border-none"
      title="Bulk Export Checks"
      fields={formFields}
      action={action}
      submitLabel="Export"
    />
  )
}
