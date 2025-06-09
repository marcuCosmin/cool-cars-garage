import { useEffect } from "react"

import { useReduxDispatch, useReduxSelector } from "../../../redux/config"
import { fetchAllCars } from "../../../redux/carsSlice"
import { CarCard } from "./CarCards"

export const CarsList = () => {
  const dispatch = useReduxDispatch()
  const { cars, metadata } = useReduxSelector(state => state.carsReducer)

  useEffect(() => {
    dispatch(fetchAllCars())
  }, [])

  if (metadata.loading) {
    return <div>Loading cars data</div>
  }

  return (
    <ul>
      {Object.entries(cars).map(([id, car]) => (
        <CarCard {...car} key={id} registrationNumber={id} />
      ))}
    </ul>
  )
}
