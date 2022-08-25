import { useEffect } from 'react'
import { useAppSelector } from '@/store'
import { CookieType, selectCookies } from '@/store/cookiesSlice'
import { loadBeamer, unloadBeamer } from '@/services/beamer'

const useBeamer = () => {
  const cookies = useAppSelector(selectCookies)
  const isBeamerEnabled = cookies[CookieType.UPDATES]

  useEffect(() => {
    isBeamerEnabled ? loadBeamer() : unloadBeamer()
  }, [isBeamerEnabled])
}

export default useBeamer
