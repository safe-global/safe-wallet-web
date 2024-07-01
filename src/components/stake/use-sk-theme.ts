import { darkTheme, lightTheme } from '@stakekit/widget'
import type { SKAppProps } from '@stakekit/widget'
import { useMemo } from 'react'
import { useDarkMode } from '../../hooks/useDarkMode'

export const useSKTheme = () => {
  const darkMode = useDarkMode()

  return useMemo((): NonNullable<SKAppProps['theme']> => {
    const initTheme = darkMode ? darkTheme : lightTheme

    return {
      ...initTheme,
      color: {
        ...initTheme.color,
        modalOverlayBackground: 'rgba(99, 102, 105, 0.75)',
        connectKit: {
          ...initTheme.color.connectKit,
          modalBackdrop: 'rgba(99, 102, 105, 0.75)',
        },
      },
    } satisfies SKAppProps['theme']
  }, [darkMode])
}
