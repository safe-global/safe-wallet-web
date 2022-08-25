import AppCommunicator from '@/services/safe-apps/AppCommunicator'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { MutableRefObject, useEffect, useState } from 'react'

const useAppCommunicator = (
  iframeRef: MutableRefObject<HTMLIFrameElement | null>,
  app?: SafeAppData,
): AppCommunicator | undefined => {
  const [communicator, setCommunicator] = useState<AppCommunicator | undefined>(undefined)

  useEffect(() => {
    let communicatorInstance: AppCommunicator
    const initCommunicator = (iframeRef: MutableRefObject<HTMLIFrameElement>, app: SafeAppData) => {
      communicatorInstance = new AppCommunicator(iframeRef, app)
      setCommunicator(communicatorInstance)
    }

    if (app) {
      initCommunicator(iframeRef as MutableRefObject<HTMLIFrameElement>, app)
    }

    return () => {
      communicatorInstance?.clear()
    }
  }, [app, iframeRef])

  return communicator
}

export default useAppCommunicator
