import type { NextPage } from 'next'
import Head from 'next/head'
import ModulesGroup from '@/components/settings/Modules'
import SettingsHeader from '@/components/settings/SettingsHeader'

const Modules: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Modules'}</title>
      </Head>

      <SettingsHeader />

      <ModulesGroup />      
    </>
  )
}

export default Modules
