import { useEffect, useRef, useState } from 'react'

const APP_LOAD_ERROR_TIMEOUT = 30000
const APP_SLOW_LOADING_WARNING_TIMEOUT = 15_000
const APP_LOAD_ERROR = 'There was an error loading the Safe App. There might be a problem with the App provider.'

type UseAppIsLoadingReturnType = {
  iframeRef: React.RefObject<HTMLIFrameElement>
  appIsLoading: boolean
  setAppIsLoading: (appIsLoading: boolean) => void
  isLoadingSlow: boolean
}

const useAppIsLoading = (): UseAppIsLoadingReturnType => {
  const [appIsLoading, setAppIsLoading] = useState<boolean>(true)
  const [isLoadingSlow, setIsLoadingSlow] = useState<boolean>(false)
  const [, setAppLoadError] = useState<boolean>(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timer = useRef<number>()
  const errorTimer = useRef<number>()

  useEffect(() => {
    const clearTimeouts = () => {
      clearTimeout(timer.current)
      clearTimeout(errorTimer.current)
    }

    if (appIsLoading) {
      timer.current = window.setTimeout(() => {
        setIsLoadingSlow(true)
      }, APP_SLOW_LOADING_WARNING_TIMEOUT)
      errorTimer.current = window.setTimeout(() => {
        setAppLoadError(() => {
          throw Error(APP_LOAD_ERROR)
        })
      }, APP_LOAD_ERROR_TIMEOUT)
    } else {
      clearTimeouts()
      setIsLoadingSlow(false)
    }

    return () => {
      clearTimeouts()
    }
  }, [appIsLoading])

  return {
    iframeRef,
    appIsLoading,
    setAppIsLoading,
    isLoadingSlow,
  }
}

export default useAppIsLoading
