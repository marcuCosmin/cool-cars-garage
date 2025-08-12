import { Android2, Apple } from "react-bootstrap-icons"

import { firebaseAuth } from "@/firebase/config"

import { getAuthToken } from "@/api/users"
import { useAppSelector } from "@/redux/config"
import { useEffect } from "react"

const deviceLinkConfig = {
  android: {
    Icon: Android2,
    label: "Android",
    href: "https://cool-cars-garage.co.uk/cool-cars-reports.apk"
  },
  ios: {
    Icon: Apple,
    label: "iOS",
    href: ""
  }
} as const

export const ReportsAuth = () => {
  const uid = useAppSelector(state => state.user.uid)

  useEffect(() => {
    if (!uid) {
      window.location.href = "/"
    }
  }, [uid])

  const onButtonClick = async () => {
    const idToken = await firebaseAuth.currentUser!.getIdToken()
    const authToken = await getAuthToken(idToken)

    window.location.href = `${import.meta.env.VITE_REPORTS_AUTH_URL}?authToken=${authToken}`
  }

  const renderDeviceLink = (device: "android" | "ios") => {
    const { Icon, label, href } = deviceLinkConfig[device]

    return (
      <a className="flex items-center gap-2" href={href}>
        <Icon size={40} /> {label}
      </a>
    )
  }

  return (
    <div className="flex justify-center items-center flex-col gap-4 p-4 h-full m-auto max-w-3xl text-center">
      <h1>Cool Cars Reports</h1>
      <p>
        Use the below button to authenticate to the <b>Cool Cars Reports</b>{" "}
        app.
      </p>
      <p>
        In order for the authentication to work, you need to have the app
        installed on your device.
      </p>
      <div>
        <p>If you don't have the app installed, you can download it below:</p>
        <div className="flex justify-around mt-4">
          {renderDeviceLink("android")}
          {renderDeviceLink("ios")}
        </div>
      </div>
      <button className="mt-5" type="button" onClick={onButtonClick}>
        Authenticate
      </button>
    </div>
  )
}
