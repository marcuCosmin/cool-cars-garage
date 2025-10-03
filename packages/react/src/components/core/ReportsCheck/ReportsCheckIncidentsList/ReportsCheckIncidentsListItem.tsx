import { PatchCheck, PatchExclamation } from "react-bootstrap-icons"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Tooltip } from "@/components/basic/Tooltip"
import { Loader } from "@/components/basic/Loader"

import { parseTimestampForDisplay } from "@/shared/utils/parseTimestampForDisplay"
import { capitalize } from "@/shared/utils/capitalize"

import type { DocWithID, IncidentDoc } from "@/shared/firestore/firestore.model"
import type { MarkDefectAsResolvedResponse } from "@/shared/requests/requests.model"

import { reportsChecksIconsSize } from "../ReportsCheck.const"

type ReportsCheckIncidentsListItemProps = DocWithID<IncidentDoc> & {
  onMarkAsResolved: (
    incidentId: string
  ) => Promise<MarkDefectAsResolvedResponse>
}

export const ReportsCheckIncidentsListItem = ({
  id,
  creationTimestamp,
  status,
  resolutionTimestamp,
  description,
  onMarkAsResolved
}: ReportsCheckIncidentsListItemProps) => {
  const { isLoading, mutate: onMarkAsResolvedClick } = useAppMutation({
    mutationFn: () => onMarkAsResolved(id),
    showToast: true
  })

  return (
    <li className="flex flex-col border border-primary rounded-md p-5 sm:w-md">
      <div className="flex flex-col gap-2 text-primary font-bold">
        <p>Report time: {parseTimestampForDisplay(creationTimestamp)}</p>
        <div className="flex items-center gap-2">
          <p>Issue status:</p>
          <Tooltip label={capitalize(status)}>
            {status === "pending" ? (
              <PatchExclamation
                size={reportsChecksIconsSize}
                className="fill-error"
              />
            ) : (
              <PatchCheck
                size={reportsChecksIconsSize}
                className="fill-success"
              />
            )}
          </Tooltip>
        </div>

        {resolutionTimestamp && (
          <p>
            Resolution time: {parseTimestampForDisplay(resolutionTimestamp)}
          </p>
        )}
      </div>

      <hr className="my-5" />

      <p className="whitespace-pre-wrap">{description}</p>

      {status === "pending" && (
        <div className="mt-auto">
          <hr className="my-5" />

          {isLoading ? (
            <Loader className="mx-auto" size="sm" />
          ) : (
            <button type="button" onClick={onMarkAsResolvedClick}>
              Mark as resolved
            </button>
          )}
        </div>
      )}
    </li>
  )
}
