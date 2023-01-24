import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { useEffect, useMemo, useState } from 'react'
import { createSafeTheme } from '@safe-global/safe-react-components'

const isSystemDarkMode = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useDarkMode = (): boolean => {
  const settings = useAppSelector(selectSettings)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    setIsDarkMode(settings.theme.darkMode ?? isSystemDarkMode())
  }, [settings.theme.darkMode])

  return isDarkMode
}

export const useLightDarkTheme = () => {
  const isDarkMode = useDarkMode()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  return useMemo(() => createSafeTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode])
}
