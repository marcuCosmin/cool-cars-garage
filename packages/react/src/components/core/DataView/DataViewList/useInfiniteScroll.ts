import { useEffect, useRef } from "react"

export const useInfiniteScroll = (onScrollEnd?: () => void) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onScrollEnd) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          onScrollEnd()
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0
      }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [onScrollEnd])

  return { sentinelRef }
}
