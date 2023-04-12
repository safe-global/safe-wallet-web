import type { NextPage } from 'next'
import Head from 'next/head'
import SafeLicenses from '@/components/licenses'

const Imprint: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Licenses</title>
      </Head>

      <main>
        <SafeLicenses />
      </main>
    </>
  )
}

export default Imprint
