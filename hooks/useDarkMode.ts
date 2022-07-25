import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { useEffect, useMemo } from 'react'
import initTheme from '@/styles/theme'

export const useDarkMode = () => {
  const settings = useAppSelector(selectSettings)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme.darkMode ? 'dark' : 'light')
  }, [settings.theme.darkMode])

  return useMemo(() => initTheme(settings.theme.darkMode), [settings.theme.darkMode])
}
