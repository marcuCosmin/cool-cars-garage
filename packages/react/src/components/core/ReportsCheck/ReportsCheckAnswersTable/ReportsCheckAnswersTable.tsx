import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Clipboard2Check } from "react-bootstrap-icons"

import { markFaultsAsResolved } from "@/api/utils"

import { type FullCheck } from "@/firebase/utils"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Tooltip } from "@/components/basic/Tooltip"
import { Checkbox } from "@/components/basic/Checkbox"
import { Loader } from "@/components/basic/Loader"

import { ReportsCheckSectionRows } from "./ReportsCheckSectionRows"

import { reportsChecksIconsSize } from "../ReportsCheck.const"

type ReportsCheckAnswersTableProps = Pick<
  FullCheck,
  "interior" | "exterior" | "faults"
> & {
  checkId: string
}

export const ReportsCheckAnswersTable = ({
  checkId,
  interior,
  exterior,
  faults
}: ReportsCheckAnswersTableProps) => {
  const { isLoading: isMutationLoading, mutate: handleMarkFaultsAsResolved } =
    useAppMutation({
      mutationFn: markFaultsAsResolved,
      showToast: true
    })
  const queryClient = useQueryClient()
  const [selectedFaults, setSelectedFaults] = useState<string[]>([])

  const pendingFaults = faults.filter(({ status }) => status === "pending")
  const hasPendingFaults = !!pendingFaults.length

  const pendingFaultsIds = pendingFaults.map(({ id }) => id)
  const headerCheckboxValue = selectedFaults.length === pendingFaultsIds.length

  const onHeaderCheckboxChange = () => {
    if (headerCheckboxValue) {
      setSelectedFaults([])
      return
    }

    setSelectedFaults(pendingFaultsIds)
  }
  const onTableCheckboxChange = (faultId?: string) => {
    if (!faultId) {
      return
    }

    if (selectedFaults.includes(faultId)) {
      setSelectedFaults(prev => prev.filter(id => id !== faultId))
      return
    }

    setSelectedFaults(prev => [...prev, faultId])
  }

  const onResolveButtonClick = async () => {
    const response = await handleMarkFaultsAsResolved({
      checkId,
      faultsIds: selectedFaults
    })

    if (response.error) {
      return
    }

    queryClient.setQueryData(["/reports", checkId], (data: FullCheck) => {
      faults = data.faults.map(fault => {
        if (selectedFaults.includes(fault.id)) {
          return { ...fault, status: "resolved" }
        }
        return fault
      })

      return {
        ...data,
        faults
      }
    })

    setSelectedFaults([])
  }

  return (
    <div className="md:min-w-xl xl:min-w-3xl w-full">
      <h2 className="text-center mb-5">Questions</h2>
      <table>
        <thead>
          <tr>
            {hasPendingFaults && (
              <th colSpan={5}>
                <div className="min-h-5 w-fit">
                  {!!selectedFaults.length &&
                    (isMutationLoading ? (
                      <Loader size="sm" />
                    ) : (
                      <Tooltip
                        label="Resolve selected faults"
                        containerTag="button"
                        containerProps={{
                          onClick: onResolveButtonClick,
                          className: "w-fit p-0 bg-transparent text-primary"
                        }}
                      >
                        <Clipboard2Check size={reportsChecksIconsSize} />
                      </Tooltip>
                    ))}
                </div>
              </th>
            )}
          </tr>
          <tr>
            {hasPendingFaults && (
              <th>
                <Checkbox
                  value={headerCheckboxValue}
                  onChange={onHeaderCheckboxChange}
                />
              </th>
            )}
            <th>Question</th>
            <th>Answer</th>
            <th>Issue Status</th>
          </tr>
        </thead>
        <tbody>
          <ReportsCheckSectionRows
            section="Interior"
            faults={faults}
            answers={interior}
            selectedFaultsIds={selectedFaults}
            onTableCheckboxChange={onTableCheckboxChange}
            showCheckboxesHeader={hasPendingFaults}
          />
          <ReportsCheckSectionRows
            faults={faults}
            section="Exterior"
            answers={exterior}
            selectedFaultsIds={selectedFaults}
            onTableCheckboxChange={onTableCheckboxChange}
            showCheckboxesHeader={hasPendingFaults}
          />
        </tbody>
      </table>
    </div>
  )
}
