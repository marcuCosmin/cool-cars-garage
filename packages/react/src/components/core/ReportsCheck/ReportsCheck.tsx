import {
  CalendarWeek,
  ExclamationTriangle,
  InfoCircle,
  PersonCircle,
  Speedometer,
  Stopwatch
} from "react-bootstrap-icons"

import { parseTimestampForDisplay } from "@/globals/utils/parseTimestampForDisplay"
import type { FullCheck } from "@/globals/firestore/firestore.model"

// import { exportChecks } from "@/api/api.utils"

// import { useAppMutation } from "@/hooks/useAppMutation"

// import { Loader } from "@/components/basic/Loader"

// import { downloadBlob } from "@/utils/downloadBlob"
import { formatDuration } from "@/utils/formatDuration"
import { mergeClassNames } from "@/utils/mergeClassNames"

import { ReportsCheckQuestionsSection } from "./ReportsCheckQuestionsSection/ReportsCheckQuestionsSection"
import { ReportsCheckIncident } from "./ReportsCheckIncident"

import { reportsChecksIconsSize } from "./ReportsCheck.const"

type CheckProps = {
  check: FullCheck
}

export const ReportsCheck = ({ check }: CheckProps) => {
  const {
    id,
    carId,
    creationTimestamp,
    exterior,
    interior,
    faults,
    incidents,
    startTimestamp,
    endTimestamp,
    driver,
    odoReading,
    faultsCount
  } = check

  const displayedDate = parseTimestampForDisplay(creationTimestamp)
  const checkDuration =
    endTimestamp && startTimestamp ? endTimestamp - startTimestamp : undefined
  const unresolvedFaultsCount = faults?.filter(
    fault => fault.status === "pending"
  ).length
  const unresolvedIncidentsCount = incidents?.filter(
    incident => incident.status === "pending"
  ).length
  const hasIncidents = !!incidents.length

  const checkMetadata = [
    { Icon: CalendarWeek, label: "Submitted on", value: displayedDate },
    {
      Icon: Stopwatch,
      label: "Duration",
      value: formatDuration(checkDuration!),
      hidden: checkDuration === undefined
    },
    {
      Icon: PersonCircle,
      label: "Reported by",
      value: `${driver.firstName} ${driver.lastName}`
    },
    {
      Icon: Speedometer,
      label: "Odometer reading",
      value: `${odoReading.value} ${odoReading.unit}`
    },
    {
      Icon: InfoCircle,
      label: "Faults count",
      value: faultsCount,
      hidden: !faultsCount
    },
    {
      Icon: InfoCircle,
      label: "Incidents count",
      value: incidents?.length,
      hidden: !incidents?.length
    },
    {
      Icon: ExclamationTriangle,
      label: "Unresolved faults",
      value: unresolvedFaultsCount,
      hidden: !unresolvedFaultsCount,
      containerClassName: "text-warning",
      valueClassName: "text-warning"
    },
    {
      Icon: ExclamationTriangle,
      label: "Unresolved incidents",
      value: unresolvedIncidentsCount,
      hidden: !unresolvedIncidentsCount,
      containerClassName: "text-warning",
      valueClassName: "text-warning"
    }
  ]

  // const onExportCheck = async () => {
  //   const blob = await exportChecks({ checkId: id, type: "individual" })

  //   downloadBlob({
  //     blob,
  //     fileName: `Check Report - ${carId} - ${displayedDate}.pdf`
  //   })
  // }

  // const { isLoading: isExporting, mutate: handleCheckExport } = useAppMutation({
  //   mutationFn: onExportCheck
  // })

  // const onExportClick = isExporting ? undefined : handleCheckExport

  return (
    <div className="flex flex-col gap-10 items-center w-full pt-10">
      <div className="flex flex-col items-center text-primary md:text-lg font-semibold">
        <h1>Check Report</h1>
        <h2 className="mb-10">{carId}</h2>

        <ul className="grid md:grid-cols-2 gap-y-3 gap-x-10 px-5">
          {checkMetadata.map(
            (
              {
                hidden,
                value,
                label,
                containerClassName,
                valueClassName,
                Icon
              },
              index
            ) => {
              if (hidden) {
                return null
              }

              return (
                <li
                  className={mergeClassNames(
                    "flex items-center gap-2",
                    containerClassName
                  )}
                  key={index}
                >
                  <Icon size={reportsChecksIconsSize} />
                  <p>
                    {label}: <span className={valueClassName}>{value}</span>
                  </p>
                </li>
              )
            }
          )}
        </ul>

        {/* <button
          type="button"
          className="flex items-center justify-center h-11 w-38 text-lg mt-3"
          onClick={onExportClick}
        >
          {isExporting ? (
            <Loader size="sm" className="border-white border-t-transparent" />
          ) : (
            "Export as PDF"
          )}
        </button> */}
      </div>

      <div
        className={mergeClassNames(
          `flex flex-col-reverse items-center 2xl:items-start 2xl:flex-row w-full gap-10 md:pb-5 md:px-5 mt-10`,
          !hasIncidents && "justify-center"
        )}
      >
        {hasIncidents && (
          <div className="flex flex-col items-center max-w-3xl w-full 2xl:w-fit">
            <h3 className="text-center mb-5">Incidents</h3>

            <ul className="flex flex-col gap-5 w-full">
              {incidents.map(incident => (
                <ReportsCheckIncident
                  {...incident}
                  checkId={id}
                  key={incident.id}
                />
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-7 w-full lg:w-fit">
          <h3 className="text-center">Questions</h3>

          <div className="flex flex-col items-center lg:items-start lg:grid lg:grid-cols-2 gap-15">
            <ReportsCheckQuestionsSection
              section="interior"
              answers={interior}
              faults={faults}
              checkId={id}
            />
            <ReportsCheckQuestionsSection
              section="exterior"
              answers={exterior}
              faults={faults}
              checkId={id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
