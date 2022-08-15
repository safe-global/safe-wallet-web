import { useEffect, useState, type ReactElement } from 'react'
import { Drawer } from '@mui/material'
import { useRouter } from 'next/router'

import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/common//Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import Footer from '../Footer'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const router = useRouter()
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false)

  const onMenuToggle = (): void => {
    setIsMobileDrawerOpen((prev) => !prev)
  }

  const sidebar = <Sidebar />

  useEffect(() => {
    setIsMobileDrawerOpen(false)
  }, [router.pathname, router.query.safe])

  return (
    <div className={css.container}>
      <Header onMenuToggle={onMenuToggle} />

      {/* Desktop sidebar */}
      <aside className={css.sidebar}>{sidebar}</aside>

      {/* Mobile sidebar */}
      <Drawer variant="temporary" anchor="left" open={isMobileDrawerOpen} onClose={onMenuToggle}>
        {sidebar}
      </Drawer>

      <div className={css.main}>
        <div className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        <Footer />
      </div>
    </div>
  )
}

export default PageLayout
