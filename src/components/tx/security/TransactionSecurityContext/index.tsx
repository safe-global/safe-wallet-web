import { type RedefineModuleResponse } from '@/services/security/modules/RedefineModule'
import { SecuritySeverity } from '@/services/security/modules/types'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { createContext } from 'react'
import { useRedefine } from '../redefine/useRedefine'

export const TransactionSecurityContext = createContext<{
  warnings: NonNullable<RedefineModuleResponse['issues']>
  balanceChange: RedefineModuleResponse['balanceChange']
  verdict: SecuritySeverity | undefined
  isLoading: boolean
  error: Error | undefined
}>({
  verdict: SecuritySeverity.NONE,
  warnings: [],
  balanceChange: undefined,
  isLoading: false,
  error: undefined,
})

export const TransactionSecurityProvider = ({
  children,
  safeTx,
}: {
  children: JSX.Element
  safeTx: SafeTransaction | undefined
}) => {
  const [redefineResponse, redefineError, redefineLoading] = useRedefine(safeTx)

  return (
    <TransactionSecurityContext.Provider
      value={{
        verdict: redefineResponse?.severity,
        warnings: redefineResponse?.payload?.issues || [],
        balanceChange: redefineResponse?.payload?.balanceChange,
        error: redefineError,
        isLoading: redefineLoading,
      }}
    >
      {children}
    </TransactionSecurityContext.Provider>
  )
}
