import * as React from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { useCustomSafeApps } from '@/hooks/safe-apps/useCustomSafeApps'

type ReturnType = {
  remoteSafeApps: SafeAppData[]
  customSafeApps: SafeAppData[]
  remoteSafeAppsLoading: boolean
  customSafeAppsLoading: boolean
  remoteSafeAppsError?: Error
  addCustomApp: (app: SafeAppData) => void
}

const useSafeApps = (): ReturnType => {
  const [remoteSafeApps = [], remoteSafeAppsError, remoteSafeAppsLoading] = useRemoteSafeApps()
  const { customSafeApps, loading: customSafeAppsLoading, updateCustomSafeApps } = useCustomSafeApps()

  const addCustomApp = React.useCallback(
    (app: SafeAppData) => {
      updateCustomSafeApps([...customSafeApps, app])
    },
    [updateCustomSafeApps, customSafeApps],
  )

  return {
    remoteSafeApps,
    customSafeApps,
    remoteSafeAppsLoading,
    customSafeAppsLoading,
    remoteSafeAppsError,
    addCustomApp,
  }
}

export { useSafeApps }
