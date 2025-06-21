import type { UserRecord } from "firebase-admin/auth"
import type { UserMetadata } from "../../models"

export type User = Pick<
  UserRecord,
  "uid" | "email" | "displayName" | "phoneNumber"
> &
  UserMetadata &
  Pick<UserRecord["metadata"], "lastSignInTime" | "creationTime">
