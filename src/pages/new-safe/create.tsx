import Head from 'next/head'
import type { NextPage } from 'next'

import CreateSafe from '@/components/new-safe/create'

const Open: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Safe – Create Safe</title>
      </Head>

      <CreateSafe />
    </main>
  )
}

export default Open
