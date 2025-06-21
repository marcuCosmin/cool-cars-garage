const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")
const { promisify } = require("util")

const execCommand = promisify(exec)

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY

const distPath = path.join(__dirname, "dist")
const firebasePrivateKeyJsonPath = path.join(
  distPath,
  "firebase-private-key.json"
)

const prebuild = async () => {
  if (!process.env.IS_CI_DEPLOY) {
    console.log("Skipping prebuild outside of CI environment")
    return
  }

  try {
    if (!firebasePrivateKey) {
      throw new Error("FIREBASE_PRIVATE_KEY is missing")
    }

    await execCommand("rm -rf dist")
    await execCommand("mkdir dist")
    fs.writeFileSync(firebasePrivateKeyJsonPath, firebasePrivateKey)
  } catch (error) {
    console.log(`Prebuild error: ${error}`)
  }
}

prebuild()
