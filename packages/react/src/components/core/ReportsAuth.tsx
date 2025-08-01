import { firebaseAuth } from "@/firebase/config"

import { getAuthToken } from "@/api/users"

import { Icon } from "@/components/basic/Icon"

export const ReportsAuth = () => {
  const onButtonClick = async () => {
    const idToken = await firebaseAuth.currentUser!.getIdToken()
    const authToken = await getAuthToken(idToken)

    window.location.href = `${import.meta.env.VITE_REPORTS_AUTH_URL}?authToken=${authToken}`
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
        <div className="flex justify-between mt-4">
          <a className="flex items-center gap-2">
            <Icon iconName="Android2" size={40} /> Android
          </a>
          <a className="flex items-center gap-2">
            <Icon iconName="Apple" size={40} /> iOS
          </a>
        </div>
      </div>
      <button className="mt-5" type="button" onClick={onButtonClick}>
        Authenticate
      </button>
    </div>
  )
}
