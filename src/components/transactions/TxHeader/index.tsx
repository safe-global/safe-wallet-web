import type { ReactElement, ReactNode } from 'react'

import PageHeader from '@/components/common/PageHeader'
import { Box } from '@mui/material'
import css from '@/components/common/PageHeader/styles.module.css'
import TxNavigation from '@/components/transactions/TxNavigation'

const TxHeader = ({ children }: { children?: ReactNode }): ReactElement => {
  return (
    <PageHeader
      title="Transactions"
      action={
        <>
          <Box className={css.pageHeader}>
            <Box className={css.navWrapper}>
              <TxNavigation />
            </Box>
            {children && <Box className={css.actionsWrapper}>{children}</Box>}
          </Box>
        </>
      }
    />
  )
}

export default TxHeader
