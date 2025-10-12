import { useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"

import { useAppDispatch } from "@/redux/config"
import { setScreenWidth } from "@/redux/screenSlice"

export const useScreenSizeListener = () => {
  const dispatch = useAppDispatch()

  const debouncedResize = useDebouncedCallback(
    () => dispatch(setScreenWidth(window.innerWidth)),
    300
  )

  useEffect(() => {
    window.addEventListener("resize", debouncedResize)

    return () => window.removeEventListener("resize", debouncedResize)
  }, [])
}
