import { useState, type ReactElement, type MouseEvent } from 'react'
import Sidebar from '@/components/common/Sidebar'
import Header from '@/components/common//Header'
import css from './styles.module.css'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false)

  const onSidebarToggle = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setSidebarExpanded((prev: boolean) => !prev)
  }

  return (
    <div className={css.container} onClick={() => setSidebarExpanded(false)}>
      <Header />

      <aside className={sidebarExpanded ? css.sidebarExpanded : ''} onClick={onSidebarToggle}>
        <Sidebar />
      </aside>

      <div className={css.main}>{children}</div>
    </div>
  )
}

export default PageLayout
