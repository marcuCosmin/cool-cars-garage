import { firestore } from "@/backend/firebase/config"
import { getFirestoreDocs } from "@/backend/firebase/utils"
import { getCarGovDetails } from "@/backend/utils/get-car-gov-details"

import type { JobScript } from "@/models"

const run = async () => {
  const cars = await getFirestoreDocs({
    collection: "cars"
  })

  const batch = firestore.batch()
  const carsRef = firestore.collection("cars")

  for (const car of cars) {
    const carGovDetails = await getCarGovDetails(car.id)

    if (!carGovDetails) {
      continue
    }

    const carRef = carsRef.doc(car.id)

    console.log(`Updating car ${car.id} with DVLA details...`)
    batch.update(carRef, carGovDetails)
    console.log(`Car ${car.id} updated successfully`)
  }

  await batch.commit()
}

export const carsGovDetails: JobScript = {
  id: "cars-gov-details",
  run
}
