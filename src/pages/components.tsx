import type { NextPage } from 'next'
import Head from 'next/head'
import ComponentLibrary from '@/components/library'

const Components: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Components</title>
      </Head>

      <main>
        <ComponentLibrary />
      </main>
    </>
  )
}

export default Components
