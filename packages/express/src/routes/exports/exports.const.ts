import { getCheckFiles } from "./checks/exports.checks"

import type { ExportableResources } from "@/globals/requests/requests.model"
import type { GetFiles } from "./exports.model"

type ExportsConfig = {
  [Resource in ExportableResources]: {
    getFiles: GetFiles<Resource>
  }
}

export const exportsConfig: ExportsConfig = {
  checks: {
    getFiles: getCheckFiles
  }
}
