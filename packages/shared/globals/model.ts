export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never

export type UnionToIntersection<Union> = (
  Union extends unknown ? (member: Union) => void : never
) extends (merged: infer Intersection) => void
  ? Intersection
  : never
