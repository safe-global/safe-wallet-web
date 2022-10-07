import type { ReactElement } from 'react'

import PageHeader from '@/components/common/PageHeader'

const TxHeader = ({ action }: { action?: ReactElement }): ReactElement => {
  return <PageHeader title="Transactions" action={action} />
}

export default TxHeader
