import type { Car } from "@/shared/models"

export type CarItemData = Omit<Car, "makeAndModel" | "registrationNumber"> & {
  id: string
  title: string
  subtitle: string
}
