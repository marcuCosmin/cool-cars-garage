import { validate as validateEmail } from "email-validator"

export type Validator = (value: string) => string

type CreateValidator = {
  min?: number
  max?: number
  required?: boolean
  customValidation?: Validator
}

const createValidator =
  ({ min, max, required, customValidation }: CreateValidator) =>
  (value: string) => {
    if (required && !value.trim()) {
      return "This field is required"
    }

    if (min && value.length < min) {
      return `Must be at least ${min} characters long`
    }

    if (max && value.length > max) {
      return `Must be at most ${max} characters long`
    }

    if (!customValidation) {
      return ""
    }

    return customValidation(value)
  }

export const getRequiredError = createValidator({
  required: true
})

export const getEmailError = createValidator({
  required: true,
  customValidation: (value: string) => {
    if (!validateEmail(value)) {
      return "Invalid email"
    }

    return ""
  }
})

export const getPasswordError = createValidator({
  required: true,
  min: 6,
  max: 20
})

export const getNameError = createValidator({
  required: true,
  min: 1,
  max: 15
})
