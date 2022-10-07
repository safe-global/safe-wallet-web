import { useRouter } from 'next/router'
import { useEffect } from 'react'

// Next.js needs to know all the static paths in advance when doing SSG (static site generation)
// @see https://nextjs.org/docs/api-reference/next.config.js/runtime-config-static-paths
// Since we cannot enumerate all the possible Safe addresses which are part of the path,
// we need to use the `?safe=` query parameter to pass the Safe address.
// However, the user should still sees `/rin:0x123.../balances` in the browser URL.

// This hook takes the `?safe=` query parameter and rewrites the URL to put the Safe address into the path
// Next.js doesn't care because dynamic path params are internally represented as query params anyway.
const usePathRewrite = () => {
  const router = useRouter()

  useEffect(() => {
    let { safe = '', ...restQuery } = router.query
    if (Array.isArray(safe)) safe = safe[0]
    if (!safe) return

    // Move the Safe address to the path
    let newPath = router.pathname.replace(/^\//, `/${safe}/`)

    // Preserve other query params
    if (Object.keys(restQuery).length) {
      const searchParams = new URLSearchParams()
      // Convert Next.js query params to URLSearchParams
      Object.entries(restQuery).forEach(([key, values]) => {
        if (!Array.isArray(values)) values = [values || '']
        values.forEach((val) => searchParams.append(key, val))
      })
      // Serialize the query
      newPath += `?${searchParams.toString()}`
    }

    if (newPath !== router.asPath) {
      // This just changes what you see in the URL bar w/o triggering any rendering or route change
      history.replaceState(history.state, '', newPath)
    }
  }, [router])
}

export default usePathRewrite
