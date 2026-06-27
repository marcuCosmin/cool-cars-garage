import { PatchCheck, PatchExclamation } from "react-bootstrap-icons"

import type {
  DocWithID,
  FullDefect,
  IncidentDoc
} from "@/globals/firestore/firestore.model"
import { parseTimestampForDisplay } from "@/globals/utils/parseTimestampForDisplay"
import { capitalize } from "@/globals/utils/capitalize"

import { useModalContext } from "@/contexts/Modal/Modal.context"

import { Collapsible } from "@/components/basic/Collapsible"
import { Tooltip } from "@/components/basic/Tooltip"

import { DataViewListItemMetadata } from "@/components/core/DataView/DataViewList/DataViewListItem/DataViewListItemMetadata"

import type { ItemMetadata } from "@/components/core/DataView/DataView.model"

import { mergeClassNames } from "@/utils/mergeClassNames"

import { reportsChecksIconsSize } from "./ReportsCheck.const"

const containerClassName = "border border-primary rounded-md p-4 2xl:max-w-lg"
const tooltipContainerClassName = "flex items-center shrink-0 mt-0.5"
const descriptionContainerClassName = "flex flex-col gap-1 min-w-0"
const dateClassName = "text-sm font-normal opacity-75"

type ReportsCheckIncidentProps = DocWithID<FullDefect<IncidentDoc>> & {
  checkId: string
}

export const ReportsCheckIncident = ({
  id,
  creationTimestamp,
  status,
  resolutionTimestamp,
  resolutionUser,
  resolutionNotes,
  resolutionFileUrl,
  description,
  checkId
}: ReportsCheckIncidentProps) => {
  const { setModalProps } = useModalContext()

  const displayedDate = parseTimestampForDisplay(creationTimestamp)
  const tooltipLabel = capitalize(status)

  const onResolveClick = () =>
    setModalProps({
      type: "resolve-defect",
      props: { defectType: "incident", defectId: id, checkId }
    })

  if (status === "pending") {
    return (
      <li
        className={mergeClassNames(
          containerClassName,
          "min-w-xs flex flex-col gap-3"
        )}
      >
        <div className="flex items-start gap-3">
          <Tooltip
            label={tooltipLabel}
            containerProps={{ className: tooltipContainerClassName }}
          >
            <PatchExclamation
              size={reportsChecksIconsSize}
              className="fill-warning"
            />
          </Tooltip>
          <div className={descriptionContainerClassName}>
            <p className="max-h-56 overflow-y-auto">{description}</p>
            <p className={dateClassName}>{displayedDate}</p>
          </div>
        </div>

        <button
          type="button"
          className="py-1 px-5 w-fit ml-auto"
          onClick={onResolveClick}
        >
          Resolve
        </button>
      </li>
    )
  }

  const resolutionMetadataConfig: Record<
    keyof Pick<
      FullDefect<IncidentDoc>,
      | "resolutionTimestamp"
      | "resolutionUser"
      | "resolutionNotes"
      | "resolutionFileUrl"
    >,
    ItemMetadata
  > = {
    resolutionTimestamp: {
      type: "date",
      label: "Resolved at",
      value: resolutionTimestamp
    },
    resolutionUser: {
      type: "text",
      label: "Resolved by",
      value:
        resolutionUser && `${resolutionUser.firstName} ${resolutionUser.lastName}`
    },
    resolutionNotes: {
      type: "text",
      label: "Resolution notes",
      value: resolutionNotes
    },
    resolutionFileUrl: {
      type: "file",
      label: "Resolution attachment",
      value: resolutionFileUrl
    }
  }

  return (
    <li className={containerClassName}>
      <Collapsible
        buttonClassName="bg-transparent p-0 w-full"
        title={isOpen => (
          <div className="flex items-start gap-3 text-left">
            <Tooltip
              label={tooltipLabel}
              containerProps={{ className: tooltipContainerClassName }}
            >
              <PatchCheck
                size={reportsChecksIconsSize}
                className="fill-success"
              />
            </Tooltip>
            <div className={descriptionContainerClassName}>
              <p className={mergeClassNames(!isOpen && "line-clamp-1")}>
                {description}
              </p>
              <p className={dateClassName}>{displayedDate}</p>
            </div>
          </div>
        )}
      >
        <DataViewListItemMetadata metadata={resolutionMetadataConfig} />
      </Collapsible>
    </li>
  )
}
