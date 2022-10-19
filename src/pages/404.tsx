import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

// Rewrite the URL to put the Safe address into the query.
const getRedirectUrl = (): string | undefined => {
  if (typeof location === 'undefined') return

  const { pathname, search } = location
  const re = /^\/([^/]+?:0x[0-9a-f]{40})/i
  const [, pathSafe] = pathname.match(re) || []

  if (pathSafe) {
    const newPath = pathname.replace(re, '') || '/'

    if (newPath !== pathname) {
      return `${newPath}?safe=${pathSafe}${search ? '&' + search.slice(1) : ''}`
    }
  }
}

const Custom404: NextPage = () => {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState<boolean>(true)

  useEffect(() => {
    const redirectUrl = getRedirectUrl()

    if (redirectUrl) {
      router.replace(redirectUrl)
    } else {
      setIsRedirecting(false)
    }
  }, [router])

  return <main>{!isRedirecting && <h1>404 - Page not found</h1>}</main>
}

export default Custom404
