import type { Car } from "../../../models"

export const CarCard = ({ registrationNumber, makeAndModel, council }: Car) => {
  return (
    <li>
      {registrationNumber} {makeAndModel} {council}
    </li>
  )
}
