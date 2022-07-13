import type { NextPage } from 'next'
import LoadSafe from '@/components/load-safe'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const LoadSafeWithAddress: NextPage = () => {
  const router = useRouter()
  const { address = '' } = router.query
  const safeAddress = Array.isArray(address) ? address[0] : address
  const [id, setId] = useState<string>(safeAddress)

  const initialData = {
    address: safeAddress,
  }

  // This is a hack to force remounting if the query param changes but not the path
  useEffect(() => {
    setId(safeAddress)
  }, [safeAddress])

  return <LoadSafe key={id} initialStep={1} initialData={[undefined, initialData]} />
}

export default LoadSafeWithAddress
