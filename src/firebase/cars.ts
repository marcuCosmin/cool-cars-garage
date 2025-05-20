import { toast } from "react-toastify"

import { doc, setDoc } from "firebase/firestore"
import { firestore } from "./config"

import type { Car } from "../models"

export const createCar = async ({ registrationNumber, ...car }: Car) => {
  const docRef = doc(firestore, "cars", registrationNumber)

  await setDoc(docRef, car)

  toast.success(
    `Car with registration number: ${registrationNumber} created successfully`
  )
}
