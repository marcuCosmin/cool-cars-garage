import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyArmswoHkIS5E0Q-VgpQWEwC0hV6Plehuw",
  authDomain: "cool-cars-garage.firebaseapp.com",
  projectId: "cool-cars-garage",
  storageBucket: "cool-cars-garage.firebasestorage.app",
  messagingSenderId: "304359101226",
  appId: "1:304359101226:web:771991f9d7016f4fd18453"
}

const firebaseApp = initializeApp(firebaseConfig)

export const firebaseAuth = getAuth(firebaseApp)
export const firestore = getFirestore(firebaseApp)
