import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Replace %3A with : in the ?safe= parameter
const useAdjustUrl = () => {
  const { asPath } = useRouter()

  useEffect(() => {
    const newPath = asPath.replace(/([?&]safe=.+?)%3A(?=0x)/g, '$1:')
    if (newPath !== asPath) {
      history.replaceState(history.state, '', newPath)
    }
  }, [asPath])
}

export default useAdjustUrl
