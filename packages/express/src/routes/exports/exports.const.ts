import { getCheckFiles } from "./checks/exports.checks"
import { getChecksExtraValidationError } from "./checks/exports.checks.utils"

import type {
  ExportableResources,
  ExportPayload
} from "@/globals/requests/requests.model"
import type { GetFiles } from "./exports.model"

type ExportsConfig = {
  [Resource in ExportableResources]: {
    getFiles: GetFiles<Resource>
    getExtraValidationError?: (
      payload: ExportPayload<Resource>
    ) => Promise<string | undefined>
  }
}

export const exportsConfig: ExportsConfig = {
  checks: {
    getFiles: getCheckFiles,
    getExtraValidationError: getChecksExtraValidationError
  }
}
