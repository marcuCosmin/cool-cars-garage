import {
  CheckCircle,
  PatchCheck,
  PatchExclamation,
  XCircle
} from "react-bootstrap-icons"

import { useModalContext } from "@/contexts/Modal/Modal.context"

import { Collapsible } from "@/components/basic/Collapsible"
import { Tooltip } from "@/components/basic/Tooltip"

import { DataViewListItemMetadata } from "@/components/core/DataView/DataViewList/DataViewListItem/DataViewListItemMetadata"

import type { ItemMetadata } from "@/components/core/DataView/DataView.model"
import type {
  CheckAnswer,
  DocWithID,
  FaultDoc,
  FullDefect
} from "@/globals/firestore/firestore.model"

import { reportsChecksIconsSize } from "../ReportsCheck.const"

type ReportsCheckQuestionCardProps = {
  answer: CheckAnswer
  fault: DocWithID<FullDefect<FaultDoc>> | undefined
  checkId: string
}

export const ReportsCheckQuestionCard = ({
  answer,
  fault,
  checkId
}: ReportsCheckQuestionCardProps) => {
  const { setModalProps } = useModalContext()

  const { label, value } = answer

  const { resolutionUser } = fault || {}

  const metadataConfig: Record<
    keyof Pick<
      FullDefect<FaultDoc>,
      | "details"
      | "resolutionTimestamp"
      | "resolutionUser"
      | "resolutionNotes"
      | "resolutionFileUrl"
    >,
    ItemMetadata
  > = {
    details: {
      type: "text",
      label: "Driver notes",
      value: fault?.details
    },
    resolutionTimestamp: {
      type: "date",
      label: "Resolution time",
      value: fault?.resolutionTimestamp
    },
    resolutionUser: {
      type: "text",
      label: "Resolution mechanic",
      value:
        resolutionUser &&
        `${resolutionUser.firstName} ${resolutionUser.lastName}`
    },
    resolutionNotes: {
      type: "text",
      label: "Resolution notes",
      value: fault?.resolutionNotes
    },
    resolutionFileUrl: {
      type: "file",
      label: "Resolution attachment",
      value: fault?.resolutionFileUrl
    }
  }

  const onResolveClick = () => {
    if (!fault) {
      return
    }

    setModalProps({
      type: "resolve-defect",
      props: { defectType: "fault", defectId: fault.id, checkId }
    })
  }

  return (
    <li className="border border-primary rounded-md p-4">
      <div className="flex items-center gap-3 w-full">
        <Tooltip
          label={value ? "Passed" : "Failed"}
          containerProps={{ className: "flex items-center shrink-0" }}
        >
          {value ? (
            <CheckCircle
              size={reportsChecksIconsSize}
              className="fill-success"
            />
          ) : (
            <XCircle size={reportsChecksIconsSize} className="fill-error" />
          )}
        </Tooltip>
        <p>{label}</p>
      </div>

      {fault && (
        <Collapsible
          defaultOpen={fault.status === "pending"}
          containerClassName="mt-4 pt-4 border-t border-primary"
          buttonClassName="bg-transparent p-0"
          title={
            <div className="flex items-center gap-3 w-full">
              <Tooltip
                label={fault.status === "resolved" ? "Resolved" : "Pending"}
                containerProps={{ className: "flex items-center shrink-0" }}
              >
                {fault.status === "resolved" ? (
                  <PatchCheck
                    size={reportsChecksIconsSize}
                    className="fill-success"
                  />
                ) : (
                  <PatchExclamation
                    size={reportsChecksIconsSize}
                    className="fill-warning"
                  />
                )}
              </Tooltip>
              <p className="text-black dark:text-white">Fault Details</p>
            </div>
          }
        >
          <div className="flex flex-col gap-3 pt-2">
            <DataViewListItemMetadata metadata={metadataConfig} />

            {fault.status === "pending" && (
              <button
                type="button"
                className="py-1 px-5 w-fit ml-auto mt-1"
                onClick={onResolveClick}
              >
                Resolve
              </button>
            )}
          </div>
        </Collapsible>
      )}
    </li>
  )
}
