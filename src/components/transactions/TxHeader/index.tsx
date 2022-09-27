import type { ReactElement } from 'react'

import PageHeader from '@/components/common/PageHeader'

const TxHeader = ({ action }: { action?: ReactElement }): ReactElement => {
  return (
    <PageHeader
      title="Transactions"
      subtitle="Confirm queued transactions and view all those in the past"
      action={action}
    />
  )
}

export default TxHeader
