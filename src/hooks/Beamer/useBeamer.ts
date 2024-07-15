import { useEffect } from 'react'

import { useAppSelector } from '@/store'
import { CookieAndTermType, selectCookies } from '@/store/cookiesAndTermsSlice'
import { loadBeamer, unloadBeamer, updateBeamer } from '@/services/beamer'
import { useCurrentChain } from '@/hooks/useChains'

const useBeamer = () => {
  const cookies = useAppSelector(selectCookies)
  const isBeamerEnabled = cookies[CookieAndTermType.UPDATES]
  const chain = useCurrentChain()

  useEffect(() => {
    if (!chain?.shortName) {
      return
    }

    if (isBeamerEnabled) {
      loadBeamer(chain.shortName)
    } else {
      unloadBeamer()
    }
  }, [isBeamerEnabled, chain?.shortName])

  useEffect(() => {
    if (isBeamerEnabled && chain?.shortName) {
      updateBeamer(chain.shortName)
    }
  }, [isBeamerEnabled, chain?.shortName])
}

export default useBeamer
