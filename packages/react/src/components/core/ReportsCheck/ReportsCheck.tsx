import { PersonCircle, Speedometer } from "react-bootstrap-icons"

import { exportChecks } from "@/api/api.utils"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Loader } from "@/components/basic/Loader"

import { downloadBlob } from "@/utils/downloadBlob"

import { parseTimestampForDisplay } from "@/globals/utils/parseTimestampForDisplay"

import type { FullCheck } from "@/globals/firestore/firestore.model"

import { ReportsCheckAnswersTable } from "./ReportsCheckAnswersTable/ReportsCheckAnswersTable"
import { ReportsCheckIncidentsList } from "./ReportsCheckIncidentsList/ReportsCheckIncidentsList"

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
    driver,
    odoReading,
    incidents,
    faultsDetails
  } = check

  const displayedDate = parseTimestampForDisplay(creationTimestamp)

  const onExportCheck = async () => {
    const blob = await exportChecks({ checkId: id, type: "individual" })

    downloadBlob({
      blob,
      fileName: `Check Report - ${carId} - ${displayedDate}.pdf`
    })
  }

  const { isLoading: isExporting, mutate: handleCheckExport } = useAppMutation({
    mutationFn: onExportCheck
  })

  const onExportClick = isExporting ? undefined : handleCheckExport

  return (
    <div className="flex flex-col items-center w-full pt-3">
      <div className="flex flex-col items-center gap-3 text-primary font-bold text-xl">
        <h1>Check Report - {carId}</h1>

        <p className="text-black dark:text-white">{displayedDate}</p>

        <div className="w-full flex items-center gap-2">
          <PersonCircle size={25} />
          <p className="break-all">
            Reported by:{" "}
            <span className="text-black dark:text-white">{`${driver.firstName} ${driver.lastName}`}</span>
          </p>
        </div>

        <div className="w-full flex items-center gap-2">
          <Speedometer size={25} />
          <p>
            Odometer reading:{" "}
            <span className="text-black dark:text-white">{`${odoReading.value} ${odoReading.unit}`}</span>
          </p>
        </div>

        <button
          type="button"
          className="flex items-center justify-center h-11 w-38 text-lg mt-3"
          onClick={onExportClick}
        >
          {isExporting ? (
            <Loader size="sm" className="border-white border-t-transparent" />
          ) : (
            "Export as PDF"
          )}
        </button>
      </div>

      <hr className="my-7 mx-auto w-[90%]" />

      <div className="flex flex-wrap justify-center w-full gap-10 md:pb-5 md:px-5 items-start">
        <ReportsCheckAnswersTable
          interior={interior}
          exterior={exterior}
          faults={faults}
          checkId={id}
          faultsDetails={faultsDetails}
        />

        {!!incidents?.length && (
          <ReportsCheckIncidentsList checkId={id} incidents={incidents} />
        )}
      </div>
    </div>
  )
}
