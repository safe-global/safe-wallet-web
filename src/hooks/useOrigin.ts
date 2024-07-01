import { useEffect, useState } from 'react'

const useOrigin = () => {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof location !== 'undefined') {
      setOrigin(location.origin)
    }
  }, [])
  return origin
}

export default useOrigin
