import * as React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { SafeAppsList } from '@/components/safe-apps/SafeAppsList'

const Apps: NextPage = () => {
  return (
    <main style={{ padding: 0 }}>
      <Head>
        <title>Safe Apps</title>
      </Head>

      <SafeAppsList />
    </main>
  )
}

export default Apps
