import type {
  CheckDoc,
  DriverMetadata,
  User
} from "../firestore/firestore.model"
import type { FormFieldValue } from "../forms/forms.models"

export type DefaultDataListItemCollapsibleMetadataValue = Record<
  string,
  FormFieldValue | undefined
>[]

type DefaultDataListItemMetadata = Record<
  string,
  FormFieldValue | undefined | DefaultDataListItemCollapsibleMetadataValue
> & {
  creationTimestamp: number
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
    Partial<DriverMetadata> & {
      invitationPending?: boolean
    }
>

export type CheckRawListItem = RawDataListItem<
  Omit<
    CheckDoc,
    "carId" | "odoReading" | "interior" | "exterior" | "driverId"
  > & {
    odoReading: string
    driver: string
  }
>
