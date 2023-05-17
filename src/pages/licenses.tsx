import type { NextPage } from 'next'
import Head from 'next/head'
import SafeLicenses from '@/components/licenses'
import { IS_OFFICIAL_HOST } from '@/config/constants'

const Imprint: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Licenses'}</title>
      </Head>

      <main>{IS_OFFICIAL_HOST && <SafeLicenses />}</main>
    </>
  )
}

export default Imprint
