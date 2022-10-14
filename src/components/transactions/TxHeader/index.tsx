import type { ReactElement } from 'react'

import PageHeader from '@/components/common/PageHeader'

const TxHeader = ({ action, title = 'Transactions' }: { action?: ReactElement; title?: string }): ReactElement => {
  return <PageHeader title={title} action={action} />
}

export default TxHeader
