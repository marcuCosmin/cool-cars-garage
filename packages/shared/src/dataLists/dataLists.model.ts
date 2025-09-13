import type {
  CheckDoc,
  DriverMetadata,
  User
} from "../firestore/firestore.model"
import type { FormFieldValue } from "../forms/forms.models"

type DefaultDataListItemMetadata = Record<
  string,
  FormFieldValue | undefined
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
  Omit<
    Partial<Pick<User, "email">> &
      Omit<User, "email"> &
      Partial<DriverMetadata>,
    "uid" | "firstName" | "lastName" | "role"
  > & {
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
