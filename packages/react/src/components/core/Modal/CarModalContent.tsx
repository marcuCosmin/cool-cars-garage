import cloneDeep from "lodash.clonedeep"

import { Form } from "../../basic/Form/Form"
import type { Fields } from "../../basic/Form/models"

import { setCar } from "../../../firebase/cars"

import { useReduxSelector } from "../../../redux/config"

import { createValidator, getRequiredError } from "../../../utils/validations"

import type { Car } from "../../../models"

const defaultFields: Fields<Car> = {
  council: {
    label: "Council",
    type: "select",
    options: ["Wolverhampton", "Cornwall", "PSV", "Portsmouth", "Other"],
    validator: getRequiredError
  },
  mot: {
    label: "MOT",
    type: "date",
    validator: getRequiredError
  },
  roadTax: {
    label: "Road Tax",
    type: "date",
    validator: getRequiredError
  },
  insurance: {
    label: "Insurance",
    type: "date",
    validator: getRequiredError
  },
  safetyChecks: {
    label: "Safety Checks",
    type: "date",
    validator: getRequiredError,
    displayCondition: ({ council }) => council === "PSV"
  },
  tachograph: {
    label: "Tachograph",
    type: "date",
    validator: getRequiredError,
    displayCondition: ({ council }) => council === "PSV"
  },
  wheelChairLift: {
    label: "Wheelchair Lift",
    type: "toggle",
    displayCondition: ({ council }) => council === "PSV"
  },
  wheelChairLiftCheck: {
    label: "Wheelchair Lift Check",
    type: "date",
    validator: getRequiredError,
    displayCondition: ({ wheelChairLift }) => wheelChairLift === "Yes"
  },
  plateNumber: {
    label: "Plate Number",
    type: "number",
    validator: createValidator({
      required: true,
      min: 3,
      max: 3
    }),
    displayCondition: ({ council }) =>
      council === "Wolverhampton" ||
      council === "Cornwall" ||
      council === "Portsmouth"
  },
  expireDate: {
    label: "Expire Date",
    type: "date",
    validator: getRequiredError,
    displayCondition: ({ council }) =>
      council === "Wolverhampton" ||
      council === "Cornwall" ||
      council === "Portsmouth"
  },
  cornwallMot: {
    label: "Cornwall MOT",
    type: "date",
    validator: getRequiredError,
    displayCondition: ({ council }) => council === "Cornwall"
  },
  registrationNumber: {
    label: "Registration Number",
    type: "text",
    validator: createValidator({
      required: true,
      min: 7,
      max: 7,
      regex: {
        pattern: /^[A-Z]{2}[0-9]{2}[A-Z]{3}$/,
        error: "Invalid registration number"
      }
    })
  },
  makeAndModel: {
    label: "Make and Model",
    type: "text",
    validator: getRequiredError
  },
  driver: {
    label: "Driver",
    type: "text",
    validator: getRequiredError
  },
  type: {
    label: "Type",
    type: "select",
    options: ["Wheelchair", "Turism", "MPV", "16 Seater"],
    validator: getRequiredError
  },
  route: {
    label: "Route",
    type: "text",
    validator: getRequiredError
  }
}

export const CarModalContent = () => {
  const { cars, metadata } = useReduxSelector(state => state.carsReducer)
  const { editedCarId } = metadata
  const car = editedCarId ? cars[editedCarId] : null

  const isEdit = !!car
  const title = isEdit ? "Edit Car" : "Add Car"
  const submitLabel = isEdit ? "Update" : "Add"

  const fields = cloneDeep(defaultFields) as Fields<Car>

  if (car) {
    Object.keys(car).forEach(key => {
      const fieldValue = car[key as keyof Omit<Car, "registrationNumber">]

      if (fields[key as keyof Fields<Car>]) {
        fields[key as keyof Fields<Car>]!.defaultValue = fieldValue
      }
    })
  }

  return (
    <Form<Car>
      title={title}
      submitLabel={submitLabel}
      fields={fields}
      action={setCar}
    />
  )
}
