import { PhoneAuthProvider, RecaptchaVerifier } from "firebase/auth"
import { Form } from "../basic/Form"
import { Input } from "../basic/Input"
import { firebaseAuth } from "../../firebase/config"

const ukNumberRegex =
  /^(?:\+44\s?7\d{8}|\+44\s?\d{2,4}\s?\d{3,4}\s?\d{3,4}|7\d{8}|\d{2,4}\s?\d{3,4}\s?\d{3,4})$/

const defaultActionState = {
  form: "",
  verificationId: ""
}

const savePhoneNumberAction = async (
  prevErrors: ActionState,
  formData: FormData
) => {
  const phoneNumber = `+44${formData.get("phone-number") as string}`

  const isValid = ukNumberRegex.test(phoneNumber)

  if (!isValid) {
    return { ...prevErrors, form: "Invalid phone number" }
  }

  const recaptchaVerifier = new RecaptchaVerifier(
    firebaseAuth,
    "recaptcha-container"
  )
  const phoneAuthProvider = new PhoneAuthProvider(firebaseAuth)

  const verificationId = await phoneAuthProvider.verifyPhoneNumber(
    phoneNumber,
    recaptchaVerifier
  )

  return { verificationId, form: "" }
}

type ActionState = typeof defaultActionState

export const VerifyPhoneNumberForm = () => {
  return (
    <div>
      <Form<ActionState>
        defaultActionState={defaultActionState}
        //@ts-expect-error this is temporary until the action is implemented
        action={savePhoneNumberAction}
        title="Cool Cars Garage"
        submitLabel="Sign up"
        FieldsFC={() => (
          <Input
            label="Phone number"
            name="phone-number"
            adornment={
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 60 30"
                  width="24"
                  height="12"
                >
                  <clipPath id="s">
                    <path d="M0,0 v30 h60 v-30 z" />
                  </clipPath>
                  <clipPath id="t">
                    <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
                  </clipPath>
                  <g clip-path="url(#s)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                    <path
                      d="M0,0 L60,30 M60,0 L0,30"
                      stroke="#fff"
                      stroke-width="6"
                    />
                    <path
                      d="M0,0 L60,30 M60,0 L0,30"
                      clip-path="url(#t)"
                      stroke="#C8102E"
                      stroke-width="4"
                    />
                    <path
                      d="M30,0 v30 M0,15 h60"
                      stroke="#fff"
                      stroke-width="10"
                    />
                    <path
                      d="M30,0 v30 M0,15 h60"
                      stroke="#C8102E"
                      stroke-width="6"
                    />
                  </g>
                </svg>
                +44
              </>
            }
          />
        )}
      />
    </div>
  )
}
