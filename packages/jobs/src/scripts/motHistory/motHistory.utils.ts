import { add, sub } from "date-fns"

import type { Council } from "@/globals/constants"

type GetCarMotExpiryTimestampProps = {
  council: Council
  motExpiryTimestamp: number
  motCompletedTimestamp?: number
}

export const getCarMotExpiryTimestamp = ({
  council,
  motExpiryTimestamp,
  motCompletedTimestamp
}: GetCarMotExpiryTimestampProps) => {
  if (council === "Cornwall") {
    if (motCompletedTimestamp) {
      return add(motCompletedTimestamp, { months: 6 }).getTime()
    }

    return sub(motExpiryTimestamp, { months: 6 }).getTime()
  }

  return motExpiryTimestamp
}
