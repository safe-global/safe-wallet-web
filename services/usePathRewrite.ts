import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// Next.js needs to know all the static paths in advance when doing SSG (static site generation)
// @see https://nextjs.org/docs/api-reference/next.config.js/runtime-config-static-paths
// Since we cannot enumerate all the possible Safe addresses which are part of the path,
// we need to use the `?safe=` query parameter to pass the Safe address.
// However, the user still sees the `/safe/` path in the browser URL.
// These two hooks make it work.

// This hook takes the `?safe=` query parameter and rewrites the URL to put the Safe address into the path
// Next.js doesn't care because dynamic path params are internally represented as query params anyway.
const usePathRewrite = () => {
  const router = useRouter()
  let { safe = '', ...restQuery } = router.query
  if (Array.isArray(safe)) safe = safe[0]
  safe = decodeURIComponent(safe)

  useEffect(() => {
    if (!safe) return
    let newPath = router.pathname.replace(/\/safe\/?/, `/${safe}/`)

    // Add the rest of the query params if any
    if (Object.keys(restQuery).length) {
      const qPairs = Object.entries(restQuery)
        .map(([key, values]) => {
          if (!(values instanceof Array)) values = [ values || '' ]
          return `${key}=${values.map(encodeURIComponent).join(',')}`
        })
        console.log(qPairs)
      newPath += `?${qPairs.join('&')}`
    }

    if (newPath !== router.pathname) {
      // This just changes what you see in the URL bar w/o triggering any rendering or route change
      history.replaceState(history.state, '', newPath)
    }
  }, [safe, router.pathname, restQuery])
}

export default usePathRewrite

// This hook is the opposite of the first one. It's called from the 404 page.
// If we see that this URL wasn't found (i.e. the pass has a dynamic Safe address and no query),
// we rewrite the URL to put the Safe address into the query.
// This must and will cause a rendering and route change.
// Thankfully, this will only happen if you reload the page or open this URL from an external link.
export const useQueryRewrite = (): boolean => {
  const [redirecting, setRedirecting] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    if (typeof location === 'undefined') return
    const currentPath = location.pathname

    const [, pathSafe] = currentPath.match(/^\/([^/]+?:0x[0-9a-fA-F]{40})/) || []

    if (pathSafe) {
      const newPath = currentPath.replace(pathSafe, 'safe')

      if (newPath !== currentPath) {
        router.replace(`${newPath}?safe=${pathSafe}${location.search ? '&' + location.search.slice(1) : ''}`)
      }
    } else {
      setRedirecting(false)
    }
  }, [router])

  return redirecting
}
