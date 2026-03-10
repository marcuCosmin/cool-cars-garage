import { useState } from "react"

import { Checkbox } from "@/components/basic/Checkbox"

import type { FullCheck } from "@/globals/firestore/firestore.model"

import { ReportsCheckSectionRows } from "./ReportsCheckSectionRows"
import { ReportsCheckTableActions } from "./ReportsCheckTableActions"

type ReportsCheckAnswersTableProps = Pick<
  FullCheck,
  "interior" | "exterior" | "faults" | "faultsDetails"
> & {
  checkId: string
}

export const ReportsCheckAnswersTable = ({
  checkId,
  interior,
  exterior,
  faults,
  faultsDetails
}: ReportsCheckAnswersTableProps) => {
  const [selectedFaults, setSelectedFaults] = useState<string[]>([])

  const pendingFaults = faults.filter(({ status }) => status === "pending")
  const hasPendingFaults = !!pendingFaults.length

  const pendingFaultsIds = pendingFaults.map(({ id }) => id)
  const headerCheckboxValue = selectedFaults.length === pendingFaultsIds.length

  const clearSelectedFaults = () => setSelectedFaults([])

  const onHeaderCheckboxChange = () => {
    if (headerCheckboxValue) {
      clearSelectedFaults()
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

  return (
    <div className="md:min-w-xl xl:min-w-3xl max-w-5xl w-full">
      <h2 className="text-center mb-5">Questions</h2>
      <table>
        <thead>
          {(hasPendingFaults || faultsDetails?.length) && (
            <ReportsCheckTableActions
              checkId={checkId}
              selectedFaults={selectedFaults}
              faultsDetails={faultsDetails}
              clearSelectedFaults={clearSelectedFaults}
            />
          )}
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
