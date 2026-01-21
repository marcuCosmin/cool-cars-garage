import type { CheckDoc } from "@/globals/firestore/firestore.model"

export type ReqBody = Partial<
  Omit<
    CheckDoc,
    "creationTimestamp" | "driverId" | "faultsCount" | "hasUnresolvedFaults"
  >
>
