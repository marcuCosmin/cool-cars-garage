import { type UserEditData } from "@/globals/forms/forms.const"
import type { RawUserListItem } from "@/globals/dataLists/dataLists.model"
import type { User } from "@/globals/firestore/firestore.model"

export const getUserDataFromRawUserListItem = (item?: RawUserListItem) => {
  if (!item) {
    return
  }

  const { title, subtitle, id, metadata } = item
  const [firstName, lastName] = title.split(" ")

  const userEditData: Required<UserEditData> = {
    uid: id,
    email: metadata.email,
    firstName,
    lastName,
    role: subtitle.toLowerCase() as User["role"],
    dbsUpdate: metadata.dbsUpdate!,
    isTaxiDriver: metadata.isTaxiDriver!,
    badgeNumber: metadata.badgeNumber!,
    badgeExpirationTimestamp: metadata.badgeExpirationTimestamp!,
    badgeAuthority: metadata.badgeAuthority!,
    isPSVDriver: metadata.isPSVDriver!,
    drivingLicenceNumber: metadata.drivingLicenceNumber!
  }

  return userEditData
}
