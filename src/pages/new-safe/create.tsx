import Head from 'next/head'
import type { NextPage } from 'next'

import CreateSafe from '@/components/new-safe/create'

const Open: NextPage = () => {
  return (
    <main>
      <Head>
        <title>{'Bitlayer Safe – Create Safe Account'}</title>
      </Head>

      <CreateSafe />
    </main>
  )
}

export default Open
