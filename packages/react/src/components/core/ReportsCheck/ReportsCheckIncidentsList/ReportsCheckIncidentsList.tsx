import { useQueryClient } from "@tanstack/react-query"

import { markIncidentAsResolved } from "@/api/utils"

import type { FullCheck } from "@/shared/firestore/firestore.model"

import { ReportsCheckIncidentsListItem } from "./ReportsCheckIncidentsListItem"

type ReportsCheckIncidentsListProps = Pick<FullCheck, "incidents"> & {
  checkId: string
}

export const ReportsCheckIncidentsList = ({
  incidents,
  checkId
}: ReportsCheckIncidentsListProps) => {
  const queryClient = useQueryClient()

  const onMarkAsResolved = async (incidentId: string) => {
    const response = await markIncidentAsResolved({ incidentId, checkId })

    queryClient.setQueryData(["/reports", checkId], (data: FullCheck) => {
      const incidents = data.incidents.map(incident => {
        if (incident.id === incidentId) {
          return {
            ...incident,
            status: "resolved",
            resolutionTimestamp: response.resolutionTimestamp
          }
        }

        return incident
      })

      return {
        ...data,
        incidents
      }
    })

    return response
  }

  return (
    <div className="w-full">
      <h2 className="text-center mb-5">Incidents</h2>

      {incidents.length ? (
        <ul className="w-full flex flex-wrap gap-5 justify-center xl:justify-start">
          {incidents.map(incident => (
            <ReportsCheckIncidentsListItem
              {...incident}
              onMarkAsResolved={onMarkAsResolved}
              key={incident.id}
            />
          ))}
        </ul>
      ) : (
        <p className="text-center">No incidents reported.</p>
      )}
    </div>
  )
}
