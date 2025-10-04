import type { CheckDoc } from "@/shared/firestore/firestore.model"

export type ReqBody = Partial<
  Omit<
    CheckDoc,
    "creationTimestamp" | "driverId" | "faultsCount" | "hasUnresolvedFaults"
  >
>
