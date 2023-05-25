import type { NextPage } from 'next'
import Head from 'next/head'
import AppearanceControl from '@/components/settings/AppearanceControl'
import SettingsHeader from '@/components/settings/SettingsHeader'

const Appearance: NextPage = () => {

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Appearance'}</title>
      </Head>

      <SettingsHeader />

      <AppearanceControl />
    </>
  )
}

export default Appearance
