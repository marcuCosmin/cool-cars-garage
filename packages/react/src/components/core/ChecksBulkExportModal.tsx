import { exportResource } from "@/api/api.utils"

import { showToast } from "@/utils/showToast"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"
import { downloadBlob } from "@/utils/downloadBlob"

import { checksBulkExportFormFields } from "@/globals/forms/forms.const"
import type { ChecksBulkExportData } from "@/globals/forms/forms.models"

const formFields = extendFormFields({
  fieldsSchema: checksBulkExportFormFields,
  additionalFieldsProps: {
    startTimestamp: { label: "Start Date" },
    endTimestamp: { label: "End Date", includeEndOfDay: true }
  }
})

export const ChecksBulkExportModal = () => {
  const action = async ({
    startTimestamp,
    endTimestamp
  }: ChecksBulkExportData) => {
    const file = await exportResource({
      resourceId: "checks",
      filters: [
        ["creationTimestamp", ">=", startTimestamp],
        ["creationTimestamp", "<=", endTimestamp]
      ]
    })

    downloadBlob(file)

    if (file.warnings) {
      const { failedReports, failedReportsCount } = file.warnings

      showToast({
        type: "warning",
        message: failedReportsCount
          ? `Bulk export completed with errors: ${failedReportsCount} report${failedReportsCount === 1 ? "" : "s"} could not be generated`
          : "Bulk export completed with errors",
        details: failedReports
      })
    }
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
