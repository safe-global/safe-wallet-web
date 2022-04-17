import { useRouter } from 'next/router'
import { useEffect } from 'react'

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
