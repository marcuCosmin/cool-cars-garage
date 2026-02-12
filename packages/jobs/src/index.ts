import nodeCron from "node-cron"
import { add } from "date-fns"

import { getFirestoreDocs } from "@/backend/firebase/utils"
import { firestore } from "@/backend/firebase/config"

import type { JobDoc } from "@/globals/firestore/firestore.model"

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

const checkAndRunJobs = async () => {
  const jobs = await getFirestoreDocs({ collection: "jobs" })

  const jobsToRun = jobs.filter(shouldRunJob)

  if (!jobsToRun.length) {
    console.log("No jobs to run at this time.")
    return
  }

  Object.values(scripts).forEach(async ({ id, run }) => {
    try {
      const job = jobsToRun.find(({ id: jobId }) => jobId === id)

      if (!job) {
        return
      }

      console.log(`Running job script: ${id}...`)
      const currenDate = new Date()

      if (job.runHour !== undefined) {
        currenDate.setHours(job.runHour || 0, 0, 0, 0)
      }

      const lastRunTimestamp = currenDate.getTime()

      await firestore.collection("jobs").doc(job.id).update({
        lastRunTimestamp
      })

      await run()
      console.log(`Finished running job script: ${id}`)
    } catch (error) {
      console.error(`Error running job script: ${id}`, error)
    }
  })
}

nodeCron.schedule("*/1 * * * *", checkAndRunJobs)
