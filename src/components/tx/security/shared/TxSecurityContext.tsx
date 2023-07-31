import { type RedefineModuleResponse } from '@/services/security/modules/RedefineModule'
import { SecuritySeverity } from '@/services/security/modules/types'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { createContext, type Dispatch, type SetStateAction, useContext, useMemo, useState } from 'react'
import { useRedefine } from '../redefine/useRedefine'

export const TxSecurityContext = createContext<{
  warnings: NonNullable<RedefineModuleResponse['issues']>
  simulationUuid: string | undefined
  balanceChange: RedefineModuleResponse['balanceChange']
  severity: SecuritySeverity | undefined
  isLoading: boolean
  error: Error | undefined
  needsRiskConfirmation: boolean
  isRiskConfirmed: boolean
  setIsRiskConfirmed: Dispatch<SetStateAction<boolean>>
  isRiskIgnored: boolean
  setIsRiskIgnored: Dispatch<SetStateAction<boolean>>
}>({
  warnings: [],
  simulationUuid: undefined,
  balanceChange: undefined,
  severity: SecuritySeverity.NONE,
  isLoading: false,
  error: undefined,
  needsRiskConfirmation: false,
  isRiskConfirmed: false,
  setIsRiskConfirmed: () => {},
  isRiskIgnored: false,
  setIsRiskIgnored: () => {},
})

export const TxSecurityProvider = ({ children }: { children: JSX.Element }) => {
  const { safeTx } = useContext(SafeTxContext)
  const [redefineResponse, redefineError, redefineLoading] = useRedefine(safeTx)
  const [isRiskConfirmed, setIsRiskConfirmed] = useState(false)
  const [isRiskIgnored, setIsRiskIgnored] = useState(false)

  const providedValue = useMemo(
    () => ({
      severity: redefineResponse?.severity,
      simulationUuid: redefineResponse?.payload?.simulation?.uuid,
      warnings: redefineResponse?.payload?.issues || [],
      balanceChange: redefineResponse?.payload?.balanceChange,
      error: redefineError,
      isLoading: redefineLoading,
      needsRiskConfirmation: !!redefineResponse && redefineResponse.severity >= SecuritySeverity.HIGH,
      isRiskConfirmed,
      setIsRiskConfirmed,
      isRiskIgnored: isRiskIgnored && !isRiskConfirmed,
      setIsRiskIgnored,
    }),
    [isRiskConfirmed, isRiskIgnored, redefineError, redefineLoading, redefineResponse],
  )

  return <TxSecurityContext.Provider value={providedValue}>{children}</TxSecurityContext.Provider>
}
