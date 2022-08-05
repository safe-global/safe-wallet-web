import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PaddedMain } from '@/components/common/PaddedMain'
import HomeIcon from '@/public/images/sidebar/home.svg'
import Dashboard from './Dashboard'

export const DashboardPage = () => {
  return (
    <PaddedMain>
      <Breadcrumbs Icon={HomeIcon} first="Dashboard" />

      <Dashboard />
    </PaddedMain>
  )
}

export default DashboardPage
