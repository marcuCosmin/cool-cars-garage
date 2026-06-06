import type {
  FileUploadQuery,
  FileUploadResponse as FileUploadReturnType
} from "@/globals/requests/requests.model"

import type { Request, Response } from "@/models"

export type FileUploadRequest = Request<
  // The Request is not expecting any params, but Multer's type expects params to be defined
  Record<string, string>,
  undefined,
  undefined,
  Partial<FileUploadQuery>
>

export type FileUploadResponse = Response<FileUploadReturnType>
