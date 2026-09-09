import type { WhereFilterOp } from "firebase-admin/firestore"

import type { DefectType } from "./firestore.model"

export const firestoreDisjunctionsLimit = 30
export const chunkableWhereFilterOperators: readonly WhereFilterOp[] = [
  "in",
  "array-contains-any"
]

type DefectTypeLabel = {
  singular: string
  plural: string
}

export const defectTypeLabels: Record<DefectType, DefectTypeLabel> = {
  faults: { singular: "Fault", plural: "Faults" },
  incidents: { singular: "Incident", plural: "Incidents" }
}
