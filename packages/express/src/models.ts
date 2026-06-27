import type {
  Request as ExpressRequest,
  Response as ExpressResponse
} from "express"

import type { AuthUser } from "@/globals/firestore/firestore.model"

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
  authorizedUser?: AuthUser
}

type DefaultResBody = Record<string, unknown>

export type Response<ResBody extends DefaultResBody = DefaultResBody> =
  ExpressResponse<ResBody | { error: string; details?: DefaultResBody }>
