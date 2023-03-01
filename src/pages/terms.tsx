import type { NextPage } from 'next'
import Head from 'next/head'
import SafeTerms from '@/components/terms'

const Imprint: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Terms</title>
      </Head>

      <main>
        <SafeTerms />
      </main>
    </>
  )
}

export default Imprint
