import { useRouter } from 'next/router'

const useSafeAddress = (): string => {
  const router = useRouter()
  let { safe = '' } = router.query
  if (Array.isArray(safe)) safe = safe[0]
  const address = safe.split(':').pop()
  return address || ''
}

export default useSafeAddress
