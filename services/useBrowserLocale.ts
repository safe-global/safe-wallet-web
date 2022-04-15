import { useEffect, useState } from 'react'

const defaultLocale = 'en-US'

let cachedLocale = ''
const getLocale = () => {
  if (!cachedLocale) {
    if (typeof navigator !== 'undefined' && navigator.language) {
      cachedLocale = navigator.language
    }
  }
  return cachedLocale || defaultLocale
}

const useBrowserLocale = (): NavigatorLanguage['language'] => {
  const [locale, setLocale] = useState<string>(defaultLocale)

  useEffect(() => {
    setLocale(getLocale)
  }, [])

  return locale
}

export default useBrowserLocale
