import { Stack } from '@mui/material'
import type { ReactElement } from 'react'

import Disclaimer from '@/components/common/Disclaimer'
import WidgetDisclaimer from '@/components/common/WidgetDisclaimer'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import madProps from '@/utils/mad-props'

// TODO: Use with swaps/staking
export function _DisclaimerWrapper({
  children,
  localStorageKey,
  widgetName,
  getLocalStorage,
}: {
  children: ReactElement
  localStorageKey: string
  widgetName: string
  getLocalStorage: typeof useLocalStorage
}): ReactElement | null {
  const [hasConsented = false, setHasConsented] = getLocalStorage<boolean>(localStorageKey)

  const onAccept = () => {
    setHasConsented(true)
  }

  if (!hasConsented) {
    return (
      <Stack direction="column" alignItems="center" justifyContent="center" flex={1}>
        <Disclaimer
          title="Note"
          content={<WidgetDisclaimer widgetName={widgetName} />}
          onAccept={onAccept}
          buttonText="Continue"
        />
      </Stack>
    )
  }

  return children
}

export const DisclaimerWrapper = madProps(_DisclaimerWrapper, {
  getLocalStorage: () => useLocalStorage,
})
