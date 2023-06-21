import { useMemo } from 'react'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useAddressBook from '@/hooks/useAddressBook'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { RecipientAddressModule } from '@/services/security/modules/RecipientAddressModule'
import type { RecipientAddressModuleResponse } from '@/services/security/modules/RecipientAddressModule'
import type { SecurityResponse } from '@/services/security/modules/types'

const RecipientAddressModuleInstance = new RecipientAddressModule()

export const useRecipientModule = (safeTransaction: SafeTransaction | undefined) => {
  const { safe, safeLoaded } = useSafeInfo()
  const web3ReadOnly = useWeb3ReadOnly()
  const addressBook = useAddressBook()

  const knownAddresses = useMemo(() => {
    const owners = safe.owners.map((owner) => owner.value)
    const addressBookAddresses = Object.keys(addressBook)

    return Array.from(new Set(owners.concat(addressBookAddresses)))
  }, [addressBook, safe.owners])

  return useAsync<SecurityResponse<RecipientAddressModuleResponse>>(() => {
    if (!safeTransaction || !web3ReadOnly || !safeLoaded) {
      return
    }

    return RecipientAddressModuleInstance.scanTransaction({
      chainId: safe.chainId,
      safeTransaction,
      knownAddresses,
      provider: web3ReadOnly,
    })
  }, [safeTransaction, web3ReadOnly, safeLoaded, safe.chainId, knownAddresses, web3ReadOnly])
}
