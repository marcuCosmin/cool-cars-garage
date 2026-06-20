import { useQuery } from "@tanstack/react-query"
import type { Icon as ReactIcon } from "react-bootstrap-icons"

import { getFile } from "@/api/api.utils"

import { DataViewMetadataItem } from "./DataViewMetadataItem"

type DataViewFileMetadataItemProps = {
  label: string
  value: string
  parsedValue: string
  Icon: ReactIcon
}

export const DataViewFileMetadataItem = ({
  label,
  parsedValue,
  Icon,
  value
}: DataViewFileMetadataItemProps) => {
  const {
    data: fileUrl,
    isLoading,
    error
  } = useQuery({
    queryKey: ["/files", value],
    queryFn: async () => {
      const blob = await getFile(value)

      return URL.createObjectURL(blob)
    }
  })

  return (
    <DataViewMetadataItem
      Icon={Icon}
      label={label}
      parsedValue={parsedValue}
      isLoading={isLoading}
      error={error?.message}
      containerTag="a"
      containerProps={{
        href: fileUrl,
        target: "_blank",
        rel: "noreferrer",
        className: "items-center w-fit"
      }}
    />
  )
}
