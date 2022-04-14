import { ReactElement } from 'react'
import Sidebar from '../Sidebar'
import css from './styles.module.css'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  return (
    <div className={css.container}>
      <aside className={css.sidebar}>
        <Sidebar />
      </aside>

      <div className={css.main}>{children}</div>
    </div>
  )
}

export default PageLayout
