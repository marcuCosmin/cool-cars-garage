import { type UserEditData } from "@/shared/forms/forms.const"
import type { RawUserListItem } from "@/shared/dataLists/dataLists.model"
import type { User } from "@/shared/firestore/firestore.model"

export const getUserDataFromRawUserListItem = (item?: RawUserListItem) => {
  if (!item) {
    return
  }

  const { title, subtitle, id, metadata } = item
  const [firstName, lastName] = title.split(" ")

  const userEditData: UserEditData = {
    uid: id,
    email: metadata.email,
    firstName,
    lastName,
    birthDate: metadata.birthDate,
    role: subtitle as User["role"],
    dbsUpdate: metadata.dbsUpdate,
    isTaxiDriver: metadata.isTaxiDriver,
    badgeNumber: metadata.badgeNumber,
    badgeExpirationDate: metadata.badgeExpirationDate,
    isPSVDriver: metadata.isPSVDriver
  }

  return userEditData
}
