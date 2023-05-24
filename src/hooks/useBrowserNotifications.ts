import { useEffect } from 'react'

// TODO: change to a favicon with a red dot
const ALT_FAVICON = '/favicons/safari-pinned-tab.svg'

const setFavicon = (favicon: HTMLLinkElement | null, href: string) => {
  if (favicon) favicon.href = href
}

const blinkFavicon = (
  favicon: HTMLLinkElement | null,
  originalHref: string,
  isBlinking = false,
): ReturnType<typeof setInterval> => {
  return setInterval(() => {
    setFavicon(favicon, isBlinking ? ALT_FAVICON : originalHref)
    isBlinking = !isBlinking
  }, 600)
}

const useBrowserNotifications = () => {
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel*="icon"]')
    const originalHref = favicon?.href || ''
    let interval: ReturnType<typeof setInterval>

    const handleVisibilityChange = () => {
      if (document.hidden) {
        interval = blinkFavicon(favicon, originalHref)
        setFavicon(favicon, ALT_FAVICON)
      } else {
        clearInterval(interval)
        setFavicon(favicon, originalHref)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    handleVisibilityChange()

    return () => {
      clearInterval(interval)
      setFavicon(favicon, originalHref)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}

export default useBrowserNotifications
