import type { NextPage } from 'next'
import Head from 'next/head'
import LoadSafe from '@/components/load-safe'

const Load: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Safe – Add Safe</title>
      </Head>

      <LoadSafe />
    </main>
  )
}

export default Load
