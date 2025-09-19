import { EmojiFrownFill } from "react-bootstrap-icons"

export const NotFound = () => {
  return (
    <div className="flex flex-col justify-center w-full items-center mt-10 gap-5 h-full">
      <h1 className="text-black dark:text-white">
        The requested resource could not be found.
      </h1>
      <EmojiFrownFill size={64} />
    </div>
  )
}
