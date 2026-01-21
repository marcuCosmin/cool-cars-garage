import { toast } from "react-toastify"

import { collection, doc, getDocs, setDoc } from "firebase/firestore"
import { firestore } from "./config"

import type { Car } from "@/globals/models"

export const getAllCars = async () => {
  const carsSnapshot = await getDocs(collection(firestore, "cars"))

  if (carsSnapshot.empty) {
    return []
  }

  const cars = carsSnapshot.docs.map(doc => {
    const data = doc.data() as Omit<Car, "registrationNumber">

    return {
      ...data,
      registrationNumber: doc.id
    }
  })

  return cars
}

export const setCar = async ({ registrationNumber, ...car }: Car) => {
  const docRef = doc(firestore, "cars", registrationNumber)

  await setDoc(docRef, car)

  toast.success(
    `Car with registration number: ${registrationNumber} created successfully`
  )
}
