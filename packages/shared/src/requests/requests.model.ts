export type MarkFaultsAsResolvedPayload = {
  faultsIds: string[]
  checkId: string
}

export type MarkIncidentAsResolvedPayload = {
  incidentId: string
  checkId: string
}

export type MarkIncidentAsResolvedResponse = {
  resolutionTimestamp: number
  message: string
}
