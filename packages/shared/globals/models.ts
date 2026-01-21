export type CarChecks = {
  mot: number
  roadTax: number
  insurance: number
  safetyChecks?: number
  tachograph?: number
  wheelChairLift?: string
  wheelChairLiftCheck?: number
  plateNumberExpiryDate?: number
  cornwallMot?: number
}

export type Car = CarChecks & {
  wheelChairLift?: string
  plateNumber?: string
  registrationNumber: string
  council: string
  makeAndModel: string
  drivers: string
  type: string
  route: string
}

export type CarCheckField = keyof CarChecks
