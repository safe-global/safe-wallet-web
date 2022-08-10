import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import LoadSafe from '@/components/load-safe'

const LoadSafeWithAddress: NextPage = () => {
  const router = useRouter()
  const { address = '' } = router.query
  const safeAddress = Array.isArray(address) ? address[0] : address
  const [id, setId] = useState<string>(safeAddress)

  const initialData = {
    safeAddress: { address: safeAddress },
  }

  // This is a hack to force remounting if the query param changes but not the path
  useEffect(() => {
    setId(safeAddress)
  }, [safeAddress])

  return (
    <main>
      <Head>
        <title>Safe – Add Safe</title>
      </Head>

      <LoadSafe key={id} initialStep={1} initialData={[undefined, initialData]} />
    </main>
  )
}

export default LoadSafeWithAddress
