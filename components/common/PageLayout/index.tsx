import useChains from '@/services/useChains'
import { useState, type ReactElement } from 'react'

import Sidebar from '@/components/common/Sidebar'
import css from '@/components/common/PageLayout/styles.module.css'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false)
  const { configs, loading } = useChains()

  const onSidebarToggle = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    setSidebarExpanded((prev: boolean) => !prev)
  }

  if (configs.length === 0 || loading) {
    return <div>Loading chain configs...</div>
  }

  return (
    <div className={css.container} onClick={() => setSidebarExpanded(false)}>
      <header>
        <img src="/logo.svg" alt="Safe" />
      </header>

      <aside className={sidebarExpanded ? css.sidebarExpanded : ''} onClick={onSidebarToggle}>
        <Sidebar />
      </aside>

      <div className={css.main}>{children}</div>
    </div>
  )
}

export default PageLayout
