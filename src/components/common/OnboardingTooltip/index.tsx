import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { Box, Button, SvgIcon, Tooltip } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import React from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'

/**
 * The OnboardingTooltip renders a sticky Tooltip with an arrow pointing towards the wrapped component.
 * This Tooltip contains a button to hide it. This decision will be stored in the local storage such that the OnboardingTooltip will only popup until clicked away once.
 */
export const OnboardingTooltip = ({
  children,
  widgetLocalStorageId,
  text,
  initiallyShown = true,
}: {
  children: React.ReactElement
  widgetLocalStorageId: string
  text: string
  initiallyShown?: boolean
}): React.ReactElement => {
  const [widgetHidden = !initiallyShown, setWidgetHidden] = useLocalStorage<boolean>(widgetLocalStorageId)
  const isDarkMode = useDarkMode()

  return widgetHidden ? (
    children
  ) : (
    <Tooltip
      open
      arrow
      title={
        <Box display="flex" alignItems="center" gap={1} padding={1}>
          <SvgIcon component={InfoIcon} inheritViewBox fontSize="small" />
          <span>{text}</span>
          <Button
            size="small"
            color={isDarkMode ? undefined : 'secondary'}
            variant="text"
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() => setWidgetHidden(true)}
          >
            Got it!
          </Button>
        </Box>
      }
    >
      {children}
    </Tooltip>
  )
}
