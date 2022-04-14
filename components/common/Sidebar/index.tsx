import { ReactElement } from 'react'
import SafeHeader from '../SafeHeader'
import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  return (
    <div className={css.container}>
      <SafeHeader />
    </div>
  )
}

export default Sidebar
