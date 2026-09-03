import nodeCron from "node-cron"
import { add } from "date-fns"

import { getFirestoreDocs } from "@/backend/firebase/utils"
import { firestore } from "@/backend/firebase/config"

import type { DocWithID, JobDoc } from "@/globals/firestore/firestore.model"

import * as scripts from "./scripts"

const shouldRunJob = ({
  lastRunTimestamp,
  interval,
  daysOfWeek,
  runHour,
  skipTimestamps
}: JobDoc) => {
  const currentDate = new Date()
  const currentTimestamp = currentDate.getTime()
  const currentDayOfWeek = currentDate.getDay()
  const currentHour = currentDate.getHours()

  if (lastRunTimestamp) {
    const lastRunDate = new Date(lastRunTimestamp)

    const nextRunDate = add(lastRunDate, interval)
    const nextRunTimestamp = nextRunDate.getTime()

    if (currentTimestamp < nextRunTimestamp) {
      return false
    }
  }

  if (runHour && currentHour < runHour) {
    return false
  }

  if (daysOfWeek && !daysOfWeek.includes(currentDayOfWeek)) {
    return false
  }

  return true
}

const groupJobs = (jobs: DocWithID<JobDoc>[]) =>
  jobs.reduce(
    (acc, job) => {
      if (job.concurrencyPreventionJobs) {
        const conflictingJobs = jobs.filter(({ id }) =>
          job.concurrencyPreventionJobs?.includes(id)
        )

        console.log(
          `For job ${job.id}, found conflicting jobs:`,
          conflictingJobs
        )

        if (conflictingJobs.length) {
          const conflictingJobsGroup = [job, ...conflictingJobs]

          const isAccEmpty = acc.length === 0
          const isGroupDuplicate = acc.some(group => {
            if (!Array.isArray(group)) {
              return false
            }

            const groupIds = group.map(job => job.id)

            return groupIds.every(id =>
              conflictingJobsGroup.some(job => job.id === id)
            )
          })

          if (isAccEmpty || !isGroupDuplicate) {
            acc.push([job, ...conflictingJobs])
          }

          return acc
        }
      }

      acc.push(job)

      return acc
    },
    [] as (DocWithID<JobDoc> | DocWithID<JobDoc>[])[]
  )

const handleJobRun = async ({ id, runHour }: DocWithID<JobDoc>) => {
  try {
    const script = Object.values(scripts).find(
      ({ id: scriptId }) => scriptId === id
    )

    if (!script) {
      console.log(`No script found for job: ${id}`)
      return
    }

    const currenDate = new Date()

    if (runHour !== undefined) {
      currenDate.setHours(runHour || 0, 0, 0, 0)
    }

    await script.run()

    const lastRunTimestamp = currenDate.getTime()

    await firestore.collection("jobs").doc(id).update({
      lastRunTimestamp
    })

    console.log(`Finished running job script: ${id}`)
  } catch (error) {
    console.log(`Uncaught error running job script for job ${id}:`, error)
  }
}

const checkAndRunJobs = async () => {
  const jobs = await getFirestoreDocs({ collection: "jobs" })

  const jobsToRun = jobs.filter(shouldRunJob)

  if (!jobsToRun.length) {
    console.log("No jobs to run at this time.")
    return
  }

  const groupedJobs = groupJobs(jobsToRun)

  groupedJobs.forEach(async group => {
    if (Array.isArray(group)) {
      const jobIds = group.map(({ id }) => id)
      console.log(
        `Running jobs: ${jobIds.join(", ")} together due to concurrency prevention.`
      )

      for (const job of group) {
        await handleJobRun(job)
      }

      console.log(
        `Finished running job scripts group for jobs: ${jobIds.join(", ")}`
      )

      return
    }

    await handleJobRun(group)
  })
}

nodeCron.schedule("*/5 * * * *", checkAndRunJobs)
