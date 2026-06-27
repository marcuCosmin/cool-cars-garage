import { type UserEditData } from "@/globals/forms/forms.const"
import type { RawUserListItem } from "@/globals/dataLists/dataLists.model"

export const getUserDataFromRawUserListItem = (item?: RawUserListItem) => {
  if (!item) {
    return
  }

  const { title, subtitle, id, metadata } = item
  const [firstName, lastName] = title.split(" ")

  const userEditData: UserEditData = {
    uid: id,
    firstName,
    lastName,
    role: subtitle.toLowerCase() as UserEditData["role"],
    ...metadata
  }

  return userEditData
}
