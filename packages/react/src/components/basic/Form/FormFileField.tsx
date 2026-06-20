import { uploadFile } from "@/api/api.utils"

import type { FormData } from "@/globals/forms/forms.models"

import { useAppMutation } from "@/hooks/useAppMutation"

import { FileInput } from "@/components/basic/FileInput"

import type { ExtendedFormFileProps } from "@/models"

import type { FormFieldComponentProps } from "./Form.models"

export type FormFileFieldProps = FormFieldComponentProps<string> &
  Pick<
    ExtendedFormFileProps<FormData>,
    "accept" | "uploadType" | "resourceId"
  >

export const FormFileField = ({
  label,
  accept,
  value,
  error,
  uploadType,
  resourceId,
  onChange,
  onBlur,
  onPendingChange
}: FormFileFieldProps) => {
  const {
    isLoading,
    error: uploadError,
    mutate
  } = useAppMutation({ mutationFn: uploadFile, shouldShowToast: false })

  const handleChange = async (file?: File) => {
    if (!file) {
      onChange(undefined)
      return
    }

    onPendingChange?.(true)
    const { response } = await mutate({ file, uploadType, resourceId })
    onPendingChange?.(false)

    onChange(response?.filePath)
  }

  return (
    <FileInput
      label={label}
      accept={accept}
      value={value}
      isLoading={isLoading}
      error={error || uploadError || undefined}
      onChange={handleChange}
      onBlur={onBlur}
    />
  )
}
