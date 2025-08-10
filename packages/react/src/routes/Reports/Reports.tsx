import { DatePicker } from "@/components/basic/DatePicker"
import { Loader } from "@/components/basic/Loader"
import { Select } from "@/components/basic/Select"
import { Toggle } from "@/components/basic/Toggle"
import { firestore } from "@/firebase/config"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  Timestamp,
  where
} from "firebase/firestore"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Calendar4Range,
  PersonVcardFill,
  Speedometer,
  Icon,
  FilterCircleFill,
  ArrowCounterclockwise,
  CheckCircleFill,
  ClockHistory
} from "react-bootstrap-icons"
import Collapsible from "react-collapsible"
import { Popover } from "react-tiny-popover"

type Report = {
  id: string
  timestamp: Timestamp
  driverName: string
  vehicleRegNumber: string
  odoReading: number
  fault?: {
    description: string
    status: "pending" | "resolved"
    resolvedAt?: Timestamp
  }[]
}

const metadataConfig: Record<
  string,
  { Icon: Icon; label: string; renderFn?: (value: any) => string }
> = {
  driverName: {
    Icon: PersonVcardFill,
    label: "Reported by:"
  },
  odoReading: {
    Icon: Speedometer,
    label: "Odometer reading:"
  },
  timestamp: {
    Icon: Calendar4Range,
    label: "Reported at:",
    renderFn: (value: Timestamp) =>
      value.toDate().toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
  }
}

const useReportsList = ({ filters }: { filters: Filters }) => {
  const [reports, setReports] = useState<Report[]>([])
  const [lastRefValue, setLastRefValue] = useState<Timestamp>()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [canFetchMore, setCanFetchMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchInitialData = async () => {
    setIsInitialLoading(true)
    const queryConstraints = [
      orderBy("timestamp", "desc"),
      filters.vehicleRegNumber !== "All" &&
        where("vehicleRegNumber", "==", filters.vehicleRegNumber),
      filters.dateRange[0] && where("timestamp", ">=", filters.dateRange[0]),
      filters.dateRange[1] && where("timestamp", "<=", filters.dateRange[1]),
      filters.hasFaults && where("fault", "!=", null),
      limit(25)
    ].filter(Boolean) as QueryConstraint[]
    const reportsRef = collection(firestore, "demo")

    const reportsQuery = query(reportsRef, ...queryConstraints)
    const reportsSnapshot = await getDocs(reportsQuery)
    const newReports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Report[]

    setCanFetchMore(newReports.length === 25)
    setLastRefValue(newReports[newReports.length - 1]?.timestamp)
    setReports(newReports)

    setIsInitialLoading(false)
  }

  const fetchMore = useCallback(async () => {
    if (!canFetchMore) {
      return
    }

    const queryConstraints = [
      orderBy("timestamp", "desc"),
      lastRefValue && startAfter(lastRefValue),
      filters.vehicleRegNumber !== "All" &&
        where("vehicleRegNumber", "==", filters.vehicleRegNumber),
      filters.dateRange[0] && where("timestamp", ">=", filters.dateRange[0]),
      filters.dateRange[1] && where("timestamp", "<=", filters.dateRange[1]),
      filters.hasFaults && where("fault", "!=", null),
      limit(25)
    ].filter(Boolean) as QueryConstraint[]
    const reportsRef = collection(firestore, "demo")

    const reportsQuery = query(reportsRef, ...queryConstraints)
    const reportsSnapshot = await getDocs(reportsQuery)
    const newReports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Report[]

    setCanFetchMore(newReports.length === 25)
    setLastRefValue(newReports[newReports.length - 1]?.timestamp)
    setReports(prev => [...prev, ...newReports])
  }, [filters, lastRefValue, canFetchMore])

  useEffect(() => {
    fetchInitialData()
  }, [filters])

  useEffect(() => {
    if (isInitialLoading) {
      return
    }

    const intersectionObserver = new IntersectionObserver(entries => {
      const [sentinelEntry] = entries

      if (sentinelEntry.isIntersecting) {
        fetchMore()
      }
    })

    intersectionObserver.observe(sentinelRef.current!)

    return () => intersectionObserver.disconnect()
  }, [isInitialLoading, fetchMore])

  return { reports, sentinelRef, isInitialLoading }
}

type Filters = {
  vehicleRegNumber: string
  dateRange: [Timestamp | undefined, Timestamp | undefined]
  hasFaults: boolean
}

const useFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    vehicleRegNumber: "All",
    dateRange: [undefined, undefined],
    hasFaults: false
  })

  const setVehicleRegNumber = (value?: string | string[]) => {
    if (Array.isArray(value)) {
      return
    }

    setFilters(prev => ({ ...prev, vehicleRegNumber: value || "All" }))
  }
  const setDateRange = (start?: Timestamp, end?: Timestamp) =>
    setFilters(prev => ({ ...prev, dateRange: [start, end] }))

  const setHasFaults = (value?: boolean) =>
    setFilters(prev => ({ ...prev, hasFaults: !!value }))

  const resetFilters = () =>
    setFilters({
      vehicleRegNumber: "All",
      dateRange: [undefined, undefined],
      hasFaults: false
    })

  return {
    filters,
    setVehicleRegNumber,
    setDateRange,
    setHasFaults,
    resetFilters
  }
}

const ReportItem = ({ report }: { report: Report }) => {
  const [isFaultsPopoverOpen, setIsFaultsPopoverOpen] = useState(false)

  return (
    <li
      key={report.id}
      className="flex flex-col gap-3 border border-primary p-5 rounded-sm sm:max-w-lg h-fit"
    >
      <div className="bg-primary p-1 w-fit rounded-sm ml-auto font-bold">
        {report.vehicleRegNumber}
      </div>
      {Object.keys(metadataConfig).map(key => {
        const { Icon, label, renderFn } =
          metadataConfig[key as keyof typeof metadataConfig]
        const value = report[key as keyof Report]
        return (
          <div className="flex items-center gap-2" key={key}>
            <Icon className="fill-primary" size={20} />
            {label}{" "}
            <div className="text-primary font-semibold">
              {renderFn ? renderFn(value) : (value as string)}
            </div>
          </div>
        )
      })}
      {!!report.fault?.length && (
        <Popover
          onClickOutside={() => setIsFaultsPopoverOpen(false)}
          isOpen={isFaultsPopoverOpen}
          content={
            <ul className="border p-2 border-primary rounded-sm shadow-none overflow-y-auto max-h-96 scrollbar">
              {report.fault.map((f, index) => (
                <li key={index}>
                  <div className="font-semibold">
                    Question:{" "}
                    <span className="text-primary font-semibold">
                      {f.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    Status:{" "}
                    <span className="text-primary font-semibold">
                      {f.status}
                    </span>
                    {f.status === "resolved" ? (
                      <CheckCircleFill className="fill-primary" />
                    ) : (
                      <ClockHistory className="fill-primary" />
                    )}
                  </div>
                  {f.resolvedAt && (
                    <div>
                      Resolved at:{" "}
                      <span className="text-primary font-semibold">
                        {f.resolvedAt?.toDate().toLocaleString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  )}

                  {!!report.fault?.[index + 1] && <hr className="mt-1" />}
                </li>
              ))}
            </ul>
          }
        >
          <button type="button" onClick={() => setIsFaultsPopoverOpen(true)}>
            {report.fault.length} Faults Reported
          </button>
        </Popover>
      )}
    </li>
  )
}

export const Reports = () => {
  const {
    filters,
    setVehicleRegNumber,
    setDateRange,
    setHasFaults,
    resetFilters
  } = useFilters()
  const { reports, sentinelRef, isInitialLoading } = useReportsList({ filters })

  if (isInitialLoading) {
    return <Loader enableOverlay text="Loading reports" />
  }

  const filtersContent = (
    <>
      <div className="flex justify-center basis-full">
        <button
          type="button"
          className="flex items-center gap-2 w-fit self-center"
          onClick={resetFilters}
        >
          <ArrowCounterclockwise size={20} />
          Reset Filters
        </button>
      </div>
      <div className="flex justify-center basis-full">
        <Toggle
          label="Only show checks with faults"
          value={filters.hasFaults}
          onChange={setHasFaults}
        />
      </div>
      <Select
        label="Vehicle"
        options={["All", "HX15BXR", "NX16EBJ", "WX57NZH", "EA11PZO"]}
        value={filters.vehicleRegNumber}
        onChange={setVehicleRegNumber}
      />
      <DatePicker
        label="Start Date"
        value={filters.dateRange[0]}
        onChange={date => setDateRange(date, filters.dateRange[1])}
      />
      <DatePicker
        label="End Date"
        value={filters.dateRange[1]}
        onChange={date => setDateRange(filters.dateRange[0], date)}
      />
    </>
  )

  return (
    <div className="flex flex-col items-center gap-5 pt-10 h-[inherit]">
      <h1 className="text-center">Reports</h1>

      <div className="hidden sm:flex flex-col p-2">
        <h2 className="flex justify-center items-center gap-2">
          <FilterCircleFill size={20} /> Filters
        </h2>
        <div className="flex flex-wrap gap-5 justify-center pt-2">
          {filtersContent}
        </div>
      </div>

      <Collapsible
        transitionTime={100}
        trigger={
          <button type="button" className="flex items-center gap-2">
            <FilterCircleFill size={20} /> Filters
          </button>
        }
      >
        <div className="mt-2 flex flex-col gap-2">{filtersContent}</div>
      </Collapsible>

      <ul className="flex flex-wrap justify-center gap-5 p-5 overflow-y-auto scrollbar">
        {reports.map(report => (
          <ReportItem key={report.id} report={report} />
        ))}
        <div className="h-1 w-full" ref={sentinelRef} />
      </ul>
    </div>
  )
}
