import { credential } from "firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

import { config as configDotenv } from "dotenv"

configDotenv()

const isDev = process.env.NODE_ENV === "development"
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY as string
const firebasePrivateKeyFile = "firebase-private-key.json"

const firebaseServiceAccount = isDev
  ? JSON.parse(firebasePrivateKey)
  : firebasePrivateKeyFile

const firebaseApp = initializeApp({
  credential: credential.cert(firebaseServiceAccount)
})

export const firestore = getFirestore(firebaseApp)
export const firebaseAuth = getAuth(firebaseApp)
