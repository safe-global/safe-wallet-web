import type { NextPage } from 'next'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import HomeIcon from '@/public/images/sidebar/home.svg'
import Dashboard from '@/components/dashboard'

const Home: NextPage = () => {
  return (
    <main>
      <Breadcrumbs Icon={HomeIcon} first="Dashboard" />
      <Dashboard />
    </main>
  )
}

export default Home
