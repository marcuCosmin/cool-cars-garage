import { FileEarmarkText, WrenchAdjustable } from "react-bootstrap-icons"
import { useQueryClient } from "@tanstack/react-query"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Loader } from "@/components/basic/Loader"
import { Tooltip } from "@/components/basic/Tooltip"
import { Dropdown } from "@/components/basic/Dropdown/Dropdown"

import { markFaultsAsResolved } from "@/api/api.utils"

import type { FullCheck } from "@/globals/firestore/firestore.model"

type ReportsCheckTableActionsProps = Pick<FullCheck, "faultsDetails"> & {
  checkId: string
  selectedFaults: string[]
  clearSelectedFaults: () => void
}

export const ReportsCheckTableActions = ({
  checkId,
  selectedFaults,
  faultsDetails,
  clearSelectedFaults
}: ReportsCheckTableActionsProps) => {
  const { isLoading: isMutationLoading, mutate: handleMarkFaultsAsResolved } =
    useAppMutation({
      mutationFn: markFaultsAsResolved,
      showToast: true
    })
  const queryClient = useQueryClient()

  const onResolveButtonClick = async () => {
    const result = await handleMarkFaultsAsResolved({
      checkId,
      faultsIds: selectedFaults
    })

    if (result.error) {
      return
    }

    queryClient.setQueryData(["/reports", checkId], (data: FullCheck) => {
      const faults = data.faults.map(fault => {
        if (selectedFaults.includes(fault.id)) {
          return {
            ...fault,
            status: "resolved",
            resolutionTimestamp: result.response?.resolutionTimestamp
          }
        }
        return fault
      })

      return {
        ...data,
        faults
      }
    })

    clearSelectedFaults()
  }
  return (
    <tr>
      <th colSpan={5}>
        <div className="w-full flex justify-end gap-3 min-h-5">
          {!!faultsDetails?.length && (
            <Dropdown
              alignment="center"
              popoverClassName="max-w-3xs"
              buttonClassName="p-0 text-primary bg-transparent w-fit"
              title={
                <Tooltip label="Faults details">
                  <FileEarmarkText size={25} />
                </Tooltip>
              }
            >
              {faultsDetails}
            </Dropdown>
          )}
          {isMutationLoading ? (
            <Loader size="sm" />
          ) : (
            <Tooltip
              label="Resolve selected faults"
              containerTag="button"
              containerProps={{
                onClick: onResolveButtonClick,
                disabled: !selectedFaults.length,
                className: "p-0 text-primary bg-transparent"
              }}
            >
              <WrenchAdjustable size={25} />
            </Tooltip>
          )}
        </div>
      </th>
    </tr>
  )
}
