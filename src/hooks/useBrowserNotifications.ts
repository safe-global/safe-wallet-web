import { useEffect } from 'react'

const useBrowserNotifications = () => {
  useEffect(() => {
    // If the tab is not active, blink the title
    const originalTitle = document.title
    let interval: ReturnType<typeof setInterval>
    let timeout: ReturnType<typeof setTimeout>
    let isBlinking = false

    const handleVisibilityChange = () => {
      clearTimeout(timeout)

      if (document.hidden) {
        interval = setInterval(() => {
          document.title = (isBlinking ? '❗️' : '❕') + originalTitle
          isBlinking = !isBlinking
        }, 600)
      } else {
        clearInterval(interval)
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
      clearInterval(interval)
    }
  }, [])
}

export default useBrowserNotifications
