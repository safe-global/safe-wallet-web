import { useCallback, useEffect, useMemo, useState } from 'react'
import { entries, setMany } from 'idb-keyval'

import { WebhookType } from '@/services/firebase/webhooks'
import { getNotificationPreferencesStore } from '@/services/firebase'

type NotifcationPreferences = { [key in WebhookType]: boolean }

const getDefaultPreferences = (): NotifcationPreferences => {
  return Object.values(WebhookType).reduce<NotifcationPreferences>((acc, type) => {
    acc[type] = true
    return acc
  }, {} as NotifcationPreferences)
}

export const useNotificationPreferences = () => {
  const [preferences, _setPreferences] = useState(getDefaultPreferences)

  const customStore = useMemo(() => {
    if (typeof window !== 'undefined') {
      return getNotificationPreferencesStore()
    }
  }, [])

  useEffect(() => {
    if (!customStore) {
      return
    }

    entries(customStore).then((entries) => {
      const _preferences = Object.fromEntries(entries)

      _setPreferences((prev) => ({ ...prev, ..._preferences }))
    })
  }, [customStore])

  const setPreferences: typeof _setPreferences = useCallback(
    (value) => {
      const newValue = value instanceof Function ? value(preferences) : value

      setMany(Object.entries(newValue), customStore).then(() => {
        _setPreferences((prev) => ({ ...prev, ...newValue }))
      })
    },
    [customStore, preferences],
  )

  return [preferences, setPreferences] as const
}
