import { ReactElement, useState } from 'react'
import Sidebar from '../Sidebar'
import css from './styles.module.css'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false)

  const onSidebarToggle = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    setSidebarExpanded((prev: boolean) => !prev)
  }

  const sidebarClasses = [css.sidebar, sidebarExpanded ? css.sidebarExpanded : ''].join(' ')

  return (
    <div className={css.container} onClick={() => setSidebarExpanded(false)}>
      <aside className={sidebarClasses} onClick={onSidebarToggle}>
        <Sidebar />
      </aside>

      <div className={css.main}>{children}</div>
    </div>
  )
}

export default PageLayout
