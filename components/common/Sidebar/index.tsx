import { ReactElement } from 'react'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  const { loading, error } = useAppSelector(selectSafeInfo)

  return (
    <div className={css.container}>
      {loading ? (
        'Loading Safe info...'
      ) : error ? (
        'Error loading Safe'
      ) : (
        <>
          <SafeHeader />
          <SafeList />
        </>
      )}
    </div>
  )
}

export default Sidebar
