import { PersonCircle, Speedometer } from "react-bootstrap-icons"

import { type FullCheck } from "@/firebase/utils"

import { useAppMutation } from "@/hooks/useAppMutation"
import { exportChecks } from "@/api/utils"
import { Loader } from "@/components/basic/Loader"

import { parseTimestampForDisplay } from "@/shared/utils/parseTimestampForDisplay"

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

    const url = URL.createObjectURL(blob)

    const linkElement = document.createElement("a")
    linkElement.href = url
    linkElement.download = `Check Report - ${carId} - ${displayedDate}.pdf`

    linkElement.click()

    URL.revokeObjectURL(url)
  }

  const { isLoading: isExporting, mutate: handleCheckExport } = useAppMutation({
    mutationFn: onExportCheck,
    showToast: true
  })

  return (
    <div className="flex flex-col items-center w-full mt-10">
      <div className="flex w-full flex-start px-5">
        {isExporting ? (
          <Loader size="sm" />
        ) : (
          <button type="button" className="w-fit" onClick={handleCheckExport}>
            Export as PDF
          </button>
        )}
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
