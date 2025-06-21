import type { Request as ExpressRequest } from "express"

export type UserMetadata = {
  role: "admin" | "user"
}

export type Request = ExpressRequest & {
  uid?: string
}

export type Car = any
