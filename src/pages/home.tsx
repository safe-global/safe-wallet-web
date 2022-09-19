import type { NextPage } from 'next'
import Head from 'next/head'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import HomeIcon from '@/public/images/sidebar/home.svg'
import Dashboard from '@/components/dashboard'

const Home: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Safe – Dashboard</title>
      </Head>

      <Breadcrumbs Icon={HomeIcon} first="Dashboard" />
      <Dashboard />
    </main>
  )
}

export default Home
