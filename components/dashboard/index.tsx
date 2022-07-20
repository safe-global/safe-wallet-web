import { NewSafeModal } from '@/components/dashboard/NewSafeModal'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import HomeIcon from '@/public/images/sidebar/home.svg'
import Dashboard from './Dashboard'

export const DashboardPage = () => {
  return (
    <main>
      <Breadcrumbs Icon={HomeIcon} first="Dashboard" />

      <Dashboard />

      <NewSafeModal />
    </main>
  )
}

export default DashboardPage
