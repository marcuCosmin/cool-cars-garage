import { validate as validateEmail } from "email-validator"

import type { FieldValue } from "../models"

export type Validator = (value?: FieldValue) => string

type CreateValidator = {
  min?: number
  max?: number
  required?: boolean
  regex?: {
    pattern: RegExp
    error: string
  }
  customValidation?: Validator
}

export const createValidator =
  ({ min, max, required, regex, customValidation }: CreateValidator) =>
  (value?: FieldValue) => {
    if (typeof value === "string") {
      value = value.trim()
    }

    if (required && !value) {
      return "This field is required"
    }

    if (typeof value === "string") {
      if (min && value.length < min) {
        return `Must be at least ${min} characters long`
      }

      if (max && value.length > max) {
        return `Must be at most ${max} characters long`
      }

      if (regex && typeof value === "string" && !regex.pattern.test(value)) {
        return regex.error
      }
    }

    if (typeof value === "number") {
      if (min && value < min) {
        return `Must be at least ${min}`
      }

      if (max && value > max) {
        return `Must be at most ${max}`
      }
    }

    if (customValidation) {
      return customValidation(value)
    }

    return ""
  }

export const getRequiredError = createValidator({
  required: true
})

export const getEmailError = createValidator({
  required: true,
  customValidation: (value = "") => {
    if (typeof value !== "string") {
      value = value.toString()
    }

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

export const getPhoneNumberError = createValidator({
  required: true,
  regex: {
    pattern:
      /^(?:\+44\s?7\d{8}|\+44\s?\d{2,4}\s?\d{3,4}\s?\d{3,4}|7\d{8}|\d{2,4}\s?\d{3,4}\s?\d{3,4})$/,
    error: "Invalid phone number"
  }
})
