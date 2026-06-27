import type { CarDoc, CheckDoc, User } from "../firestore/firestore.model"
import type { DistributiveOmit, UnionToIntersection } from "../model"
import type { FormFieldValue } from "../forms/forms.models"

export type DefaultListMetadataValue = Record<
  string,
  FormFieldValue | undefined
>[]

type DefaultDataListItemMetadata = Record<
  string,
  FormFieldValue | undefined | DefaultListMetadataValue
> & {
  creationTimestamp?: number
}

export type RawDataListItem<
  Metadata extends DefaultDataListItemMetadata = DefaultDataListItemMetadata
> = {
  id: string
  title: string
  subtitle: string
  metadata: Metadata
}

export type RawUserListItem = RawDataListItem<
  Partial<
    UnionToIntersection<
      DistributiveOmit<User, "firstName" | "lastName" | "role" | "uid">
    >
  >
>

export type CheckRawListItem = RawDataListItem<
  Omit<
    CheckDoc,
    | "carId"
    | "odoReading"
    | "interior"
    | "exterior"
    | "driverId"
    | "faultsDetails"
    | "startTimestamp"
    | "endTimestamp"
  > & {
    odoReading: string
    driver: string
    checkDuration?: number
  }
>

export type RawCarListItem = RawDataListItem<
  Omit<CarDoc, "council" | "driverId">
>
