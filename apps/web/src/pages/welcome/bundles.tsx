import MyBundles from '@/features/bundle/components/MyBundles'
import type { NextPage } from 'next'
import Head from 'next/head'
import { BRAND_NAME } from '@/config/constants'

const Bundles: NextPage = () => {
  return (
    <>
      <Head>
        <title>{`${BRAND_NAME} – My bundles`}</title>
      </Head>

      <MyBundles />
    </>
  )
}

export default Bundles
