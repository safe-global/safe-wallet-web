import type { NextPage } from 'next'
import Head from 'next/head'
import SettingsHeader from '@/components/settings/SettingsHeader'
import SetupControl from '@/components/settings/SetupControl'

const Setup: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Setup'}</title>
      </Head>

      <SettingsHeader />

      <SetupControl />
    </>
  )
}

export default Setup
