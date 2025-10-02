export type MarkFaultsAsResolvedPayload = {
  faultsIds: string[]
  checkId: string
}

export type MarkIncidentAsResolvedPayload = {
  incidentId: string
  checkId: string
}

export type MarkDefectAsResolvedResponse = {
  resolutionTimestamp: number
  message: string
}

export type CarsCheckExportURLQuery =
  | {
      checkId: string
      type: "individual"
    }
  | {
      startTimestamp?: number
      endTimestamp?: number
      type: "bulk"
    }
