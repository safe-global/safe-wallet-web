import type { NextPage } from 'next'
import Head from 'next/head'
import EnvironmentVariables from '@/components/settings/EnvironmentVariables'

const EnvironmentVariablesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Environment variables</title>
      </Head>

      <main>
        <EnvironmentVariables />
      </main>
    </>
  )
}

export default EnvironmentVariablesPage
