import { Alert } from '@mui/material'
import { getSafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useState, useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { isAddress } from 'ethers/lib/utils'
import type { ReactElement } from 'react'

import { isSmartContractWallet } from '@/utils/wallets'
import useDebounce from '@/hooks/useDebounce'
import useSafeInfo from '@/hooks/useSafeInfo'
import { UpsertRecoveryFlowFields } from '.'
import { sameAddress } from '@/utils/addresses'

export function GuardianWarning(): ReactElement | null {
  const { safe, safeAddress } = useSafeInfo()
  const [warning, setWarning] = useState<string>()

  const guardian = useWatch({ name: UpsertRecoveryFlowFields.guardian })
  const debouncedGuardian = useDebounce(guardian, 500)

  useEffect(() => {
    setWarning(undefined)

    if (!isAddress(debouncedGuardian) || sameAddress(debouncedGuardian, safeAddress)) {
      return
    }

    ;(async () => {
      let isSmartContract = false

      try {
        isSmartContract = await isSmartContractWallet(safe.chainId, debouncedGuardian)
      } catch {
        return
      }

      // EOA
      if (!isSmartContract) {
        return
      }

      try {
        await getSafeInfo(safe.chainId, debouncedGuardian)
      } catch {
        setWarning('The given address is a smart contract. Please ensure that it can execute transactions.')
      }
    })()
  }, [debouncedGuardian, safe.chainId, safeAddress])

  if (!warning) {
    return null
  }

  return (
    <Alert severity="warning" sx={{ border: 'unset' }}>
      {warning}
    </Alert>
  )
}
