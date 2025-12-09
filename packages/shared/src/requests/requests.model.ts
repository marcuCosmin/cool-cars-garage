import type { User } from "../firestore/firestore.model"

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
      type: "bulk"
      startTimestamp: number
      endTimestamp: number
    }

export type RegisterUserResponse = {
  authToken: string
}

export type ReiniviteUserPayload = Pick<User, "uid">

export type CreateUserResponse = {
  user: User
}

export type DeleteUserQueryParams = Pick<User, "uid">

export type GetUsersResponse = {
  users: User[]
}
