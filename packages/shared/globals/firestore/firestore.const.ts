import type { WhereFilterOp } from "firebase-admin/firestore"

export const firestoreDisjunctionsLimit = 30
export const chunkableWhereFilterOperators: readonly WhereFilterOp[] = [
  "in",
  "array-contains-any"
]
