import { useQueryClient } from "@tanstack/react-query"

import { resolveFault, resolveIncident } from "@/api/api.utils"

import type { FullCheck } from "@/globals/firestore/firestore.model"
import type { FileEntityType } from "@/globals/requests/requests.model"
import {
  resolveDefectFields,
  type ResolveDefectFields
} from "@/globals/forms/forms.const"

import { useAppSelector } from "@/redux/redux.config"
import { useModalContext } from "@/contexts/Modal/Modal.context"

import { Form } from "@/components/basic/Form/Form"

import {
  extendFormFields,
  type AdditionalFieldsProps
} from "@/utils/extendFormFields"

export type ResolveDefectModalProps = {
  defectType: "fault" | "incident"
  defectId: string
  checkId: string
}

export const ResolveDefectModal = ({
  defectType,
  defectId,
  checkId
}: ResolveDefectModalProps) => {
  const { setModalProps } = useModalContext()
  const queryClient = useQueryClient()
  const uid = useAppSelector(({ user }) => user.uid)

  const uploadType: FileEntityType =
    defectType === "fault" ? "faults" : "incidents"

  const additionalFieldsProps: AdditionalFieldsProps<ResolveDefectFields> = {
    resolutionFilePath: {
      type: "file",
      label: "Attachment",
      uploadType,
      resourceId: defectId,
      accept: "image/jpeg,image/png,image/webp,application/pdf"
    },
    resolutionUserId: { shouldHide: () => true },
    resolutionNotes: {
      type: "textarea",
      label: "Resolution notes",
      rows: 6
    }
  }

  const fields = extendFormFields({
    fieldsSchema: resolveDefectFields,
    additionalFieldsProps
  })

  const action = async (formData: ResolveDefectFields) => {
    const payload = { ...formData, resolutionUserId: uid }

    const result =
      defectType === "fault"
        ? await resolveFault({ faultId: defectId, ...payload })
        : await resolveIncident({ incidentId: defectId, ...payload })

    const cacheKey = defectType === "fault" ? "faults" : "incidents"
    queryClient.setQueryData(["/reports", checkId], (data: FullCheck) => ({
      ...data,
      [cacheKey]: data[cacheKey].map(item => {
        if (item.id !== defectId) {
          return item
        }

        const resolvedItem = {
          ...item,
          status: "resolved",
          resolutionNotes: formData.resolutionNotes,
          resolutionTimestamp: result.resolutionTimestamp
        }

        if (formData.resolutionFilePath) {
          resolvedItem.resolutionFileUrl = formData.resolutionFilePath
        }

        return resolvedItem
      })
    }))

    setModalProps(null)
  }

  return (
    <Form
      containerClassName="p-0 border-none md:min-w-lg"
      title={`Resolve ${defectType}`}
      submitLabel="Resolve"
      fields={fields}
      action={action}
    />
  )
}
