import { type RedefineModuleResponse } from '@/services/security/modules/RedefineModule'
import { SecuritySeverity } from '@/services/security/modules/types'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { createContext, useMemo, useState } from 'react'
import { useRedefine } from '../redefine/useRedefine'

export const TransactionSecurityContext = createContext<{
  warnings: NonNullable<RedefineModuleResponse['issues']>
  simulationUuid: string | undefined
  balanceChange: RedefineModuleResponse['balanceChange']
  verdict: SecuritySeverity | undefined
  isLoading: boolean
  error: Error | undefined
  needsRiskConfirmation: boolean
  isRiskConfirmed: boolean
  setIsRiskConfirmed: (value: boolean) => void
}>({
  verdict: SecuritySeverity.NONE,
  simulationUuid: undefined,
  warnings: [],
  balanceChange: undefined,
  isLoading: false,
  error: undefined,
  needsRiskConfirmation: false,
  isRiskConfirmed: false,
  setIsRiskConfirmed: () => {},
})

export const TransactionSecurityProvider = ({
  children,
  safeTx,
}: {
  children: JSX.Element
  safeTx: SafeTransaction | undefined
}) => {
  const [redefineResponse, redefineError, redefineLoading] = useRedefine(safeTx)
  const [isRiskConfirmed, setIsRiskConfirmed] = useState(false)

  const providedValue = useMemo(
    () => ({
      verdict: redefineResponse?.severity,
      simulationUuid: redefineResponse?.payload?.simulation?.uuid,
      warnings: redefineResponse?.payload?.issues || [],
      balanceChange: redefineResponse?.payload?.balanceChange,
      error: redefineError,
      isLoading: redefineLoading,
      needsRiskConfirmation: !!redefineResponse && redefineResponse.severity >= SecuritySeverity.HIGH,
      isRiskConfirmed,
      setIsRiskConfirmed,
    }),
    [isRiskConfirmed, redefineError, redefineLoading, redefineResponse],
  )

  return <TransactionSecurityContext.Provider value={providedValue}>{children}</TransactionSecurityContext.Provider>
}
