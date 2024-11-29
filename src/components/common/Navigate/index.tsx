import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }): null {
  const router = useRouter()

  useEffect(() => {
    if (replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }, [replace, router, to])

  return null
}
