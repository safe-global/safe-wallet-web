import { useLayoutEffect } from 'react'
import { useRouter } from 'next/router'

const Redirect = ({ pathname }: { pathname: string }) => {
  const router = useRouter()

  useLayoutEffect(() => {
    router.replace({ pathname, query: router.query })
  }, [])

  return null
}

export default Redirect
