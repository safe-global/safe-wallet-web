import { useState, type ReactElement, type MouseEvent } from 'react'
import { Button } from '@mui/material'

import Sidebar from '@/components/common/Sidebar'
import useOnboard from '@/services/wallets/useOnboard'
import css from '@/components/common/PageLayout/styles.module.css'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const onboard = useOnboard()
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false)

  const onSidebarToggle = (e: MouseEvent<HTMLElement>) => {
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
