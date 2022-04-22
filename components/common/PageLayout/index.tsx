import { useState, type ReactElement } from 'react'

import Sidebar from '@/components/common/Sidebar'
import useOnboard from '@/services/useOnboard'
import css from '@/components/common/PageLayout/styles.module.css'
import { Button } from '@mui/material'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const onboard = useOnboard()
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false)

  const onSidebarToggle = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    setSidebarExpanded((prev: boolean) => !prev)
  }

  return (
    <div className={css.container} onClick={() => setSidebarExpanded(false)}>
      <header>
        <img src="/logo.svg" alt="Safe" />
        <Button onClick={() => onboard?.connectWallet()} variant="contained">
          Connect Wallet
        </Button>
      </header>

      <aside className={sidebarExpanded ? css.sidebarExpanded : ''} onClick={onSidebarToggle}>
        <Sidebar />
      </aside>

      <div className={css.main}>{children}</div>
    </div>
  )
}

export default PageLayout
