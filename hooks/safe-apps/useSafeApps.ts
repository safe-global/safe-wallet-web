import * as React from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { useCustomSafeApps } from '@/hooks/safe-apps/useCustomSafeApps'

type ReturnType = {
  allSafeApps: SafeAppData[]
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

  const allSafeApps = React.useMemo(
    () => remoteSafeApps.concat(customSafeApps).sort((a, b) => a.name.localeCompare(b.name)),
    [remoteSafeApps, customSafeApps],
  )

  const addCustomApp = React.useCallback(
    (app: SafeAppData) => {
      updateCustomSafeApps([...customSafeApps, app])
    },
    [updateCustomSafeApps, customSafeApps],
  )

  return {
    allSafeApps,
    remoteSafeApps,
    customSafeApps,
    remoteSafeAppsLoading,
    customSafeAppsLoading,
    remoteSafeAppsError,
    addCustomApp,
  }
}

export { useSafeApps }
