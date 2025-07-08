import type { Request as ExpressRequest } from "express"

export type UserMetadata = {
  role: "admin" | "user"
}

type ParsedQueryString = {
  [key: string]:
    | undefined
    | string
    | ParsedQueryString
    | (string | ParsedQueryString)[]
}

export type Request<
  Params = Record<string, string> | undefined,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQueryString | undefined,
  Locals extends Record<string, unknown> = Record<string, unknown>
> = ExpressRequest<Params, ResBody, ReqBody, ReqQuery, Locals> & {
  uid?: string
}
