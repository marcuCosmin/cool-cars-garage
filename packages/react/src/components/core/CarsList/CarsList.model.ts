import type { Car } from "@/globals/models"

export type CarItemData = Omit<Car, "makeAndModel" | "registrationNumber"> & {
  id: string
  title: string
  subtitle: string
}
