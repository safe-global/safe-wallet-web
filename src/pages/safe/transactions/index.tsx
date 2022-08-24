import type { ReactElement } from 'react'

import Redirect from '@/components/common/Redirect'
import { AppRoutes } from '@/config/routes'

const Transactions = (): ReactElement => {
  return <Redirect pathname={AppRoutes.safe.transactions.history} />
}

export default Transactions
