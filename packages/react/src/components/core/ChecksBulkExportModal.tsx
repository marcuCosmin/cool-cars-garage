import { exportResource } from "@/api/api.utils"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"
import { downloadBlob } from "@/utils/downloadBlob"

import {
  checksBulkExportFormFields,
  type ChecksBulkExportData
} from "@/globals/forms/forms.const"

const formFields = extendFormFields({
  fieldsSchema: checksBulkExportFormFields,
  additionalFieldsProps: {
    startTimestamp: { label: "Start Date" },
    endTimestamp: { label: "End Date", includeEndOfDay: true }
  }
})

export const ChecksBulkExportModal = () => {
  const action = async ({ startTimestamp, endTimestamp }: ChecksBulkExportData) => {
    const file = await exportResource({
      resourceId: "checks",
      filters: [
        ["creationTimestamp", ">=", startTimestamp],
        ["creationTimestamp", "<=", endTimestamp]
      ]
    })

    downloadBlob(file)
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
