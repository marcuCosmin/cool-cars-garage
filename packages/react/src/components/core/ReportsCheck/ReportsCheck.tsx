import { PersonCircle, Speedometer } from "react-bootstrap-icons"

import { exportChecks } from "@/api/utils"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Loader } from "@/components/basic/Loader"

import { downloadBlob } from "@/utils/downloadBlob"

import { parseTimestampForDisplay } from "@/shared/utils/parseTimestampForDisplay"

import type { FullCheck } from "@/shared/firestore/firestore.model"

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
    incidents
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
    mutationFn: onExportCheck,
    showToast: true
  })

  const onExportClick = isExporting ? undefined : handleCheckExport

  return (
    <div className="flex flex-col items-center w-full mt-10">
      <div className="flex w-full flex-start px-5 mb-3">
        <button
          type="button"
          className="flex justify-center w-32"
          onClick={onExportClick}
        >
          {isExporting ? (
            <Loader size="sm" className="border-white border-t-transparent" />
          ) : (
            "Export as PDF"
          )}
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 text-primary font-bold text-xl">
        <h1>Check Report - {carId}</h1>

        <p>{displayedDate}</p>

        <div className="flex justify-center items-center gap-2">
          <PersonCircle size={25} />
          <p className="break-all">
            Reported by: {`${driver.firstName} ${driver.lastName}`}
          </p>
        </div>

        <div className="flex justify-center items-center gap-2">
          <Speedometer size={25} />
          <p>Odometer reading: {`${odoReading.value} ${odoReading.unit}`}</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center xl:justify-start xl:flex-nowrap w-full gap-10 mt-10 p-5 items-start">
        <ReportsCheckAnswersTable
          interior={interior}
          exterior={exterior}
          faults={faults}
          checkId={id}
        />

        <ReportsCheckIncidentsList checkId={id} incidents={incidents} />
      </div>
    </div>
  )
}
