import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import LoadSafe from '@/components/load-safe'

const Load: NextPage = () => {
  const router = useRouter()
  const { address = '' } = router.query
  const safeAddress = Array.isArray(address) ? address[0] : address

  return (
    <main>
      <Head>
        <title>Safe – Add Safe</title>
      </Head>

      {safeAddress ? (
        <LoadSafe key={safeAddress} initialStep={1} initialData={[undefined, { address: safeAddress }]} />
      ) : (
        <LoadSafe />
      )}
    </main>
  )
}

export default Load
