import type { NextPage } from 'next'
import Head from 'next/head'
import SettingsHeader from '@/components/settings/SettingsHeader'
import EnvironmentVariables from '@/components/settings/EnvironmentVariables'

const EnvironmentVariablesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Settings – Environment variables</title>
      </Head>

      <SettingsHeader />

      <main>
        <EnvironmentVariables />
      </main>
    </>
  )
}

export default EnvironmentVariablesPage
