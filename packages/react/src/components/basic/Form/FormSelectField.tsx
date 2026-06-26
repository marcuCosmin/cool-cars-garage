import { useQuery } from "@tanstack/react-query"

import type { FormData } from "@/globals/forms/forms.models"
import type { FirestoreCollectionsNames } from "@/globals/firestore/firestore.model"

import { getFirestoreDocs } from "@/firebase/firebase.utils"

import type { FormSelectDynamicOptions } from "@/utils/extendFormFields"

import type { ExtendedFormSelectProps } from "@/models"

import type { FormFieldComponentProps } from "./Form.models"

import { Select, type SelectProps } from "../Select"

export type FormSelectFieldProps = FormFieldComponentProps<string> &
  Pick<ExtendedFormSelectProps<FormData>, "options">

export const FormSelectField = ({
  options,
  ...props
}: FormSelectFieldProps) => {
  const isStatic = Array.isArray(options)
  const dynamicOptions = options as FormSelectDynamicOptions<
    FirestoreCollectionsNames,
    true
  >

  const { data = [], isLoading } = useQuery({
    queryKey: [
      dynamicOptions.collectionId,
      ...(dynamicOptions.filters || []),
      dynamicOptions.order?.direction,
      dynamicOptions.order?.field
    ],
    queryFn: () => getFirestoreDocs(dynamicOptions),
    enabled: !isStatic
  })

  const passedOptions = isStatic
    ? options
    : data.map(doc => ({
        value: dynamicOptions.getValue(doc),
        label: dynamicOptions.getLabel(doc)
      }))

  return (
    <Select
      {...props}
      onChange={props.onChange as SelectProps["onChange"]}
      isLoading={isLoading}
      options={passedOptions}
    />
  )
}
