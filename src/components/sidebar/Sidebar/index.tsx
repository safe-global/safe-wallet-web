import { useState, type ReactElement } from 'react'
import { useRouter } from 'next/router'

import SafeList from '@/components/sidebar/SafeList'

import css from './styles.module.css'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'
import GroupList from '../GroupList'

const Sidebar = (): ReactElement => {
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const isSafeRoute = !!router.query?.safe

  const onDrawerToggle = () => {
    trackEvent({ ...OVERVIEW_EVENTS.SIDEBAR, label: isDrawerOpen ? 'Close' : 'Open' })
    setIsDrawerOpen((prev) => !prev)
  }

  return (
    <div className={css.container}>
      <div className={css.scroll}>
        <SafeList />
      </div>
    </div>
  )
}

export default Sidebar
