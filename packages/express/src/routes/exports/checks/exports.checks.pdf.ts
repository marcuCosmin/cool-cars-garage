import { parseTimestampForDisplay } from "@/globals/utils/parseTimestampForDisplay"
import { formatDuration } from "@/globals/utils/formatDuration"
import { formatUserName } from "@/globals/utils/formatUserName"
import { capitalize } from "@/globals/utils/capitalize"
import { reportsQuestionsSections } from "@/globals/constants"

import type {
  CheckAnswer,
  CheckAnswerValue,
  CheckWithDriver,
  FaultDoc,
  FullCheck,
  FullDefect,
  IncidentDoc,
  ReportsQuestionsSection
} from "@/globals/firestore/firestore.model"

import { html, type Interpolated } from "../utils/exports.pdf.utils"

import {
  getDefectAttachmentFilename,
  type CheckFilenameData
} from "./exports.checks.utils"

const badgeClassNames = {
  error: "bg-error/10 text-error",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  neutral: "bg-gray/10 text-gray"
}

type RenderTextWithBadgeProps = {
  tag: "li" | "div"
  label: Interpolated
  badgeStatus: keyof typeof badgeClassNames
  badgeLabel: string
}
const renderTextWithBadge = ({
  tag,
  label,
  badgeStatus,
  badgeLabel
}: RenderTextWithBadgeProps) => {
  const badgeClassName = badgeClassNames[badgeStatus]

  return html`
    <${tag} class="flex items-center justify-between py-2 border-b border-light-gray last:border-0">
      <span>${label}</span>
      <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClassName}">
        ${badgeLabel}
      </span>
    </${tag}>`
}

type MetadataItem = {
  label: string
  value: string | number
}
type RenderMetadataProps = {
  metadata: MetadataItem[]
  className?: string
}
const renderMetadata = ({ metadata, className }: RenderMetadataProps) => {
  if (!metadata.length) {
    return ""
  }

  return html`
    <ul class="${className ?? ""}">
      ${metadata.map(
        ({ label, value }) =>
          html`<li>
            ${label}:
            <span class="text-gray whitespace-pre-wrap">${value}</span>
          </li>`
      )}
    </ul>`
}

const answerBadges: Record<
  `${CheckAnswerValue}`,
  Pick<RenderTextWithBadgeProps, "badgeStatus" | "badgeLabel">
> = {
  true: { badgeStatus: "success", badgeLabel: "Passed" },
  false: { badgeStatus: "error", badgeLabel: "Failed" },
  "not-applicable": { badgeStatus: "neutral", badgeLabel: "N/A" }
}

type RenderAnswersSectionProps = {
  sectionType: ReportsQuestionsSection
  answers: CheckAnswer[]
}
const renderCheckAnswers = ({
  sectionType,
  answers
}: RenderAnswersSectionProps) => {
  const label = capitalize(sectionType)

  return html`
    <section class="card">
      <h2>${label}</h2>
      <ul>
        ${answers.map(({ label, value }) =>
          renderTextWithBadge({
            tag: "li",
            label,
            ...answerBadges[`${value}`]
          })
        )}
      </ul>
    </section>
  `
}

type RenderDefectsProps = { check: CheckFilenameData } & (
  | {
      type: "faults"
      defects: FullDefect<FaultDoc>[]
    }
  | {
      type: "incidents"
      defects: FullDefect<IncidentDoc>[]
    }
)

const renderDefects = ({ type, defects, check }: RenderDefectsProps) => {
  if (!defects.length) {
    return ""
  }

  const isFaultsSection = type === "faults"
  const title = isFaultsSection ? "Faults" : "Incidents"
  const attachmentType = isFaultsSection ? "faults" : "incidents"

  const defectsData = isFaultsSection
    ? defects.map(({ question, details, ...defect }, index) => ({
        label: question,
        driverNotes: details,
        index: index + 1,
        ...defect
      }))
    : defects.map(({ description, ...defect }, index) => ({
        label: description,
        driverNotes: null,
        index: index + 1,
        ...defect
      }))

  return html`
    <section class="mb-6">
      <h2>${title}</h2>
      <ul>
        ${defectsData.map(
          ({
            label,
            driverNotes,
            resolutionNotes,
            resolutionTimestamp,
            resolutionUser,
            resolutionFileUrl,
            status,
            index
          }) => {
            const isResolved = status === "resolved"

            const resolutionMetadata = [
              !!driverNotes && {
                value: driverNotes,
                label: "Driver notes"
              },
              !!resolutionUser && {
                value: formatUserName(resolutionUser),
                label: "Resolved by"
              },
              !!resolutionTimestamp && {
                value: parseTimestampForDisplay(resolutionTimestamp),
                label: "Resolved at"
              },
              !!resolutionNotes && {
                value: resolutionNotes,
                label: "Resolution notes"
              },
              !!resolutionFileUrl && {
                value: getDefectAttachmentFilename({
                  check,
                  type: attachmentType,
                  defectNumber: index,
                  resolutionFileUrl
                }),
                label: "Attachment name"
              }
            ].flatMap(item => (item ? [item] : []))

            return html`
              <li class="card mb-3">
                ${renderTextWithBadge({
                  tag: "div",
                  label: html`<span class="font-bold text-primary">${index}.</span>
                    ${label}`,
                  badgeStatus: isResolved ? "success" : "warning",
                  badgeLabel: isResolved ? "Resolved" : "Pending"
                })}

                ${renderMetadata({
                  metadata: resolutionMetadata,
                  className: "flex flex-col mt-2 gap-1"
                })}
              </li>`
          }
        )}
      </ul>
    </section>
  `
}

export const renderIndividualCheckBody = ({
  driver,
  creationTimestamp,
  odoReading,
  carId,
  answers,
  faults,
  incidents,
  startTimestamp,
  endTimestamp
}: FullCheck) => {
  const answersBySection = Object.groupBy(answers, answer => answer.section)
  const sections = reportsQuestionsSections.filter(
    section => answersBySection[section]?.length
  )
  const driverName = formatUserName(driver)
  const displayedTimestamp = parseTimestampForDisplay(creationTimestamp)
  const displayedOdoReading = `${odoReading.value} ${odoReading.unit}`
  const defectsCount = faults.length + incidents.length

  const metadata = [
    {
      value: driverName,
      label: "Driver"
    },
    {
      value: displayedTimestamp,
      label: "Date"
    },
    {
      value: displayedOdoReading,
      label: "Odometer"
    },
    { value: formatDuration(endTimestamp - startTimestamp), label: "Duration" },
    {
      value: defectsCount,
      label: "Defects count"
    }
  ]

  return html`
    <section class="mb-6 pb-4 border-b-2 border-primary">
      <h1>${carId}</h1>
      ${renderMetadata({ metadata, className: "flex justify-between mt-1" })}
    </section>

    <div class="flex flex-col gap-6 mb-6">
      ${sections.map(section =>
        renderCheckAnswers({
          sectionType: section,
          answers: answersBySection[section] ?? []
        })
      )}
    </div>

    ${renderDefects({
      type: "faults",
      defects: faults,
      check: { carId, creationTimestamp, driver }
    })}
    ${renderDefects({
      type: "incidents",
      defects: incidents,
      check: { carId, creationTimestamp, driver }
    })}
  `
}

export const renderBulkChecksBody = (checks: CheckWithDriver[]) => {
  const renderRow = (check: CheckWithDriver) =>
    html`<tr class="break-inside-avoid border-b border-light-gray">
      <td class="py-2 px-3 font-semibold text-gray-800">${check.carId}</td>
      <td class="py-2 px-3 text-gray-700">${formatUserName(check.driver)}</td>
      <td class="py-2 px-3 text-gray-700">
        ${parseTimestampForDisplay(check.creationTimestamp)}
      </td>
      <td class="py-2 px-3 text-gray-700">
        ${check.odoReading.value} ${check.odoReading.unit}
      </td>
      <td
        class="py-2 px-3 text-center font-semibold ${check.faultsCount
          ? "text-error"
          : "text-gray-400"}"
      >
        ${check.faultsCount ?? 0}
      </td>
      <td
        class="py-2 px-3 text-center font-semibold ${check.incidentsCount
          ? "text-error"
          : "text-gray-400"}"
      >
        ${check.incidentsCount ?? 0}
      </td>
    </tr>`

  return html`
    <section class="mb-6 pb-4 border-b-2 border-primary">
      <h1>Checks summary</h1>
      <p class="mt-1 text-gray-500">${checks.length} checks</p>
    </section>

    <table class="w-full text-sm border-collapse">
      <thead>
        <tr class="bg-primary text-white">
          <th class="py-2 px-3 text-left font-semibold">Car</th>
          <th class="py-2 px-3 text-left font-semibold">Driver</th>
          <th class="py-2 px-3 text-left font-semibold">Date</th>
          <th class="py-2 px-3 text-left font-semibold">Odometer</th>
          <th class="py-2 px-3 text-center font-semibold">Faults</th>
          <th class="py-2 px-3 text-center font-semibold">Incidents</th>
        </tr>
      </thead>
      <tbody>
        ${checks.map(renderRow)}
      </tbody>
    </table>`
}
