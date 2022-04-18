import { useEffect, useState } from 'react'

const defaultLocale = 'en-US'

const getLocale = () => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language
  }
  return defaultLocale
}

const useBrowserLocale = (): NavigatorLanguage['language'] => {
  const [locale, setLocale] = useState<string>(defaultLocale)

  useEffect(() => {
    setLocale(getLocale)
  }, [])

  return locale
}

export default useBrowserLocale
