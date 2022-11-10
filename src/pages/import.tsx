import DataManagement from '@/components/settings/DataManagement'
import type { NextPage } from 'next'
import Head from 'next/head'

const Import: NextPage = () => {
  return (
    <>
      <Head>
        <title>Data Import</title>
      </Head>

      <main>
        <DataManagement />
      </main>
    </>
  )
}

export default Import
