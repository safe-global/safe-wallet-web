import { ReactElement } from 'react'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  return (
    <div className={css.container}>
      <SafeHeader />

      <SafeList />
    </div>
  )
}

export default Sidebar
