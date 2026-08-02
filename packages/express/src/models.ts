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

type DefaultJSONResponse = Record<string, unknown>

type ResponseBody<ResBody> =
  | (ResBody extends Record<string, unknown>
      ? ResBody & { message?: string }
      : ResBody | { message: string })
  | { error: string; details?: Record<string, string> }

export type Request<
  Params = Record<string, string> | undefined,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQueryString | undefined,
  Locals extends Record<string, unknown> = Record<string, unknown>
> = ExpressRequest<Params, ResponseBody<ResBody>, ReqBody, ReqQuery, Locals> & {
  authorizedUser?: AuthUser
}

export type Response<ResBody = DefaultJSONResponse> = ExpressResponse<
  ResponseBody<ResBody>
>
