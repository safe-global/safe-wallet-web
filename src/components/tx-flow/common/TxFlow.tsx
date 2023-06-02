import type { ReactNode } from 'react'
import SafeTxProvider from '../../SafeTxProvider'

const TxFlow = ({ children }: { children: ReactNode }) => {
  return <SafeTxProvider>{children}</SafeTxProvider>
}

export default TxFlow
