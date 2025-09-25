import { PersonCircle, Speedometer } from "react-bootstrap-icons"

import { type FullCheck } from "@/firebase/utils"

import { parseTimestampForDisplay } from "@/utils/parseTimestampForDisplay"

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

  return (
    <div className="flex flex-col items-center w-full mt-10">
      <div className="flex flex-col items-center gap-3 text-primary font-bold text-xl">
        <h1>Check Report - {carId}</h1>

        <p>{parseTimestampForDisplay(creationTimestamp)}</p>

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
