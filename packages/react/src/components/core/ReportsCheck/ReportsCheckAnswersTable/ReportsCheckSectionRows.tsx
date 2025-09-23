import {
  CheckCircle,
  PatchCheck,
  PatchExclamation,
  XCircle
} from "react-bootstrap-icons"

import { FullCheck } from "@/firebase/utils"

import { Tooltip } from "@/components/basic/Tooltip"
import { Checkbox } from "@/components/basic/Checkbox"

import { capitalize } from "@/utils/capitalize"

import type { CheckAnswer } from "@/shared/firestore/firestore.model"

const iconsSize = 25

type ReportsCheckSectionRowsProps = Pick<FullCheck, "faults"> & {
  section: "Interior" | "Exterior"
  answers: CheckAnswer[]
  selectedFaultsIds: string[]
  onTableCheckboxChange: (faultId?: string) => void
  showCheckboxesHeader: boolean
}

export const ReportsCheckSectionRows = ({
  section,
  answers,
  selectedFaultsIds,
  faults,
  onTableCheckboxChange,
  showCheckboxesHeader
}: ReportsCheckSectionRowsProps) => {
  return (
    <>
      <tr>
        <td colSpan={4} className="font-bold text-primary text-xl">
          {capitalize(section)}
        </td>
      </tr>

      {answers.map((answer, index) => {
        const { label, value } = answer
        const fault = faults.find(
          ({ description }) => description === answer.label
        )

        const isFaultSelected = fault
          ? selectedFaultsIds.includes(fault.id)
          : false
        const onCheckboxChange = () => onTableCheckboxChange(fault?.id)

        return (
          <tr key={index}>
            {showCheckboxesHeader && (
              <td>
                {fault?.status === "pending" && (
                  <Checkbox
                    value={isFaultSelected}
                    onChange={onCheckboxChange}
                  />
                )}
              </td>
            )}
            <td>{label}</td>
            <td>
              <Tooltip
                containerProps={{ className: "w-full flex justify-center" }}
                label={value ? "Passed" : "Failed"}
              >
                {value ? (
                  <CheckCircle className="fill-success" size={iconsSize} />
                ) : (
                  <XCircle className="fill-error" size={iconsSize} />
                )}
              </Tooltip>
            </td>
            <td>
              {fault?.status && (
                <Tooltip
                  label={capitalize(fault.status)}
                  containerProps={{
                    className: "w-full flex justify-center"
                  }}
                >
                  {fault.status === "pending" ? (
                    <PatchExclamation size={iconsSize} className="fill-error" />
                  ) : (
                    <PatchCheck size={iconsSize} className="fill-success" />
                  )}
                </Tooltip>
              )}
            </td>
          </tr>
        )
      })}
    </>
  )
}
