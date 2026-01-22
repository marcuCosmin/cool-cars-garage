import { credential } from "firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

import { config as configDotenv } from "dotenv"

configDotenv()

const firebaseApp = initializeApp({
  credential: credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS!)
})

export const firestore = getFirestore(firebaseApp)
export const firebaseAuth = getAuth(firebaseApp)
