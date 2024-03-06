import type { ReactElement, ReactNode } from 'react'

import PageHeader from '@/components/common/PageHeader'
import css from '@/components/common/PageHeader/styles.module.css'
import TxNavigation from '@/components/transactions/TxNavigation'

const TxHeader = ({ children }: { children?: ReactNode }): ReactElement => {
  return (
    <PageHeader
      title="Transactions"
      action={
        <div data-sid="39251" className={css.pageHeader}>
          <div data-sid="91602" className={css.navWrapper}>
            <TxNavigation />
          </div>
          {children && (
            <div data-sid="61849" className={css.actionsWrapper}>
              {children}
            </div>
          )}
        </div>
      }
    />
  )
}

export default TxHeader
