import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// Rewrite the URL so that `/safe/` is replaced by the value in `?safe=`
const usePathRewrite = () => {
  const router = useRouter()
  let { safe = '' } = router.query
  if (Array.isArray(safe)) safe = safe[0]

  useEffect(() => {
    if (!safe) return
    const newPath = router.pathname.replace(/\/safe\//, `/${safe}/`)
    if (newPath !== router.pathname) {
      history.replaceState(history.state, '', newPath)
    }
  }, [safe, router.pathname])
}

export default usePathRewrite

// Rewrite the URL back to `?safe=`
export const useQueryRewrite = (): boolean => {
  const [redirecting, setRedirecting] = useState<boolean>(true)

  useEffect(() => {
    if (typeof location === 'undefined') return

    const [_, pathSafe] = location.pathname.match(/^\/([^\/]+)/) || []

    if (pathSafe) {
      const newPath = location.pathname.replace(pathSafe, 'safe')
      location.href = `${newPath}?safe=${pathSafe}${location.search ? '&' + location.search.slice(1) : ''}`
    } else {
      setRedirecting(false)
    }
  }, [setRedirecting])

  return redirecting
}
