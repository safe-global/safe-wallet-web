import { NewSafeModal } from '@/components/home/NewSafeModal'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import HomeIcon from '@/public/images/sidebar/home.svg'

export const Dashboard = () => {
  return (
    <main>
      <Breadcrumbs Icon={HomeIcon} first="Dashboard" />
      <NewSafeModal />
    </main>
  )
}
