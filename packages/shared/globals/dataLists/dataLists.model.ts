import type {
  CarDoc,
  CheckDoc,
  DriverData,
  User
} from "../firestore/firestore.model"
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
  Omit<User, "firstName" | "lastName" | "role" | "uid"> &
    Partial<Omit<DriverData, "firstName" | "lastName">> & {
      invitationPending?: boolean
    }
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
  > & {
    odoReading: string
    driver: string
  }
>

export type RawCarListItem = RawDataListItem<Omit<CarDoc, "council">>
