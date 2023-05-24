import { useEffect } from 'react'

const blinkTitle = (originalTitle: string, isBlinking = false): ReturnType<typeof setTimeout> => {
  document.title = (isBlinking ? '❕' : '❗️') + originalTitle
  return setTimeout(() => blinkTitle(originalTitle, !isBlinking), 600)
}

const useBrowserNotifications = () => {
  useEffect(() => {
    // If the tab is not active, blink the title
    const originalTitle = document.title
    let timeout: ReturnType<typeof setTimeout>

    const handleVisibilityChange = () => {
      clearTimeout(timeout)

      if (document.hidden) {
        timeout = blinkTitle(originalTitle)
      } else {
        timeout = setTimeout(() => {
          document.title = originalTitle
        }, 1000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    handleVisibilityChange()

    return () => {
      document.title = originalTitle
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearTimeout(timeout)
    }
  }, [])
}

export default useBrowserNotifications
