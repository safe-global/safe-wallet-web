import { useMemo } from 'react'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useAddressBook from '@/hooks/useAddressBook'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3 } from '@/hooks/wallets/web3'
import { RecipientAddressModule } from '@/services/security/modules/RecipientAddressModule'
import type { RecipientAddressModuleResponse } from '@/services/security/modules/RecipientAddressModule'
import type { SecurityResponse } from '@/services/security/modules/types'

const RecipientAddressModuleInstance = new RecipientAddressModule()

// TODO: Not being used right now
export const useRecipientModule = (safeTransaction: SafeTransaction | undefined) => {
  const { safe, safeLoaded } = useSafeInfo()
  const web3 = useWeb3()
  const addressBook = useAddressBook()

  const knownAddresses = useMemo(() => {
    const owners = safe.owners.map((owner) => owner.value)
    const addressBookAddresses = Object.keys(addressBook)

    return Array.from(new Set(owners.concat(addressBookAddresses)))
  }, [addressBook, safe.owners])

  return useAsync<SecurityResponse<RecipientAddressModuleResponse>>(() => {
    if (!safeTransaction || !web3 || !safeLoaded) {
      return
    }

    return RecipientAddressModuleInstance.scanTransaction({
      chainId: safe.chainId,
      safeTransaction,
      knownAddresses,
      provider: web3,
    })
  }, [safeTransaction, web3, safeLoaded, safe.chainId, knownAddresses])
}
