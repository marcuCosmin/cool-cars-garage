import { useActionState } from "react"

import { signInUser } from "../firebase/auth"

import { Input } from "../components/Input"
import { Loader } from "../components/Loader"

const defaultActionState = {
  email: "",
  password: "",
  form: ""
}

type ActionState = typeof defaultActionState

const getInputError = (value: string) => {
  if (value) {
    return ""
  }

  return "This field is required"
}

const loginAction = async (prevErrors: ActionState, formData: FormData) => {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const newErrors: ActionState = {
    ...prevErrors,
    email: getInputError(email),
    password: getInputError(password)
  }

  if (newErrors.email || newErrors.password) {
    newErrors.form = ""

    return newErrors
  }

  const error = await signInUser({ email, password })

  if (error) {
    newErrors.form = error
  } else {
    newErrors.form = ""
  }

  return newErrors
}

export const Login = () => {
  const [errors, action, isLoading] = useActionState<ActionState, FormData>(
    loginAction,
    defaultActionState
  )

  return (
    <form
      className="fixed-center flex flex-col gap-5 items-center border rounded-md p-5 max-w-md dark:bg-primary w-[95%] shadow-lg"
      action={action}
    >
      {isLoading && <Loader enableOverlay />}
      <h1>Cool Cars Garage</h1>
      <hr />
      <Input error={errors.email} name="email" label="Email" type="text" />
      <Input
        error={errors.password}
        name="password"
        label="Password"
        type="password"
      />
      <hr className="mt-4" />
      {errors.form && <span className="form-error">{errors.form}</span>}
      <button type="submit">Log in</button>
    </form>
  )
}
