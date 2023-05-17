import useAddressBook from '@/hooks/useAddressBook'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { type RedefinedModuleResponse } from '@/services/security/modules/RedefineModule'
import type { SecurityResponse } from '@/services/security/modules/types'
import type { UnknownAddressModuleResponse } from '@/services/security/modules/UnknownAddressModule'
import type { UnusedAddressModuleResponse } from '@/services/security/modules/UnusedAddressModule'
import { dispatchTxScan, SecurityModuleNames } from '@/services/security/service'
import CircularProgress from '@mui/material/CircularProgress'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { useMemo } from 'react'
import { SecurityWarning, SecurityHint } from '../SecurityWarnings'

const useUnknownAddress = (safeTransaction: SafeTransaction | undefined) => {
  const addressBook = useAddressBook()
  const addressBookAddresses = useMemo(() => Object.keys(addressBook), [addressBook])
  const web3Provider = useWeb3ReadOnly()

  return useAsync<SecurityResponse<UnknownAddressModuleResponse>>(() => {
    if (!safeTransaction || !web3Provider) {
      return
    }

    return dispatchTxScan({
      type: SecurityModuleNames.UNKNOWN_ADDRESS,
      request: {
        knownAddresses: addressBookAddresses,
        provider: web3Provider,
        safeTransaction,
      },
    })
  }, [safeTransaction, web3Provider, addressBookAddresses])
}

const useUnusedAddress = (safeTransaction: SafeTransaction | undefined) => {
  const provider = useWeb3ReadOnly()

  return useAsync<SecurityResponse<UnusedAddressModuleResponse>>(() => {
    if (!safeTransaction || !provider) {
      return
    }

    return dispatchTxScan({
      type: SecurityModuleNames.UNUSED_ADDRESS,
      request: {
        provider,
        safeTransaction,
      },
    })
  }, [provider, safeTransaction])
}

const useRedefine = (safeTransaction: SafeTransaction | undefined) => {
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()

  return useAsync<SecurityResponse<RedefinedModuleResponse>>(() => {
    if (!safeTransaction || !wallet?.address) {
      return
    }
    return dispatchTxScan({
      type: SecurityModuleNames.REDEFINE,
      request: {
        chainId: Number(safe.chainId),
        safeTransaction,
        safeAddress,
        walletAddress: wallet.address,
        threshold: safe.threshold,
      },
    })
  }, [safe.chainId, safe.threshold, safeAddress, safeTransaction, wallet?.address])
}

export const TxSecurityWarnings = ({ safeTx }: { safeTx: SafeTransaction | undefined }) => {
  // const [redefineScanResult] = useRedefine(safeTx)
  const [unknownAddressScanResult] = useUnknownAddress(safeTx)
  const [unusedAddressScanResult] = useUnusedAddress(safeTx)

  if (!unknownAddressScanResult || !unusedAddressScanResult) {
    return <CircularProgress />
  }

  return (
    <>
      {/* Redefine:
      {redefineScanResult.payload && (
        <SecurityHint
        severity={redefineScanResult.severity}
        text={redefineScanResult.payload?.issues.map((issue) => issue.description).join('\n')}
        />
        )}
        <SecurityWarning severity={redefineScanResult.severity} />
      */}
      Unknown Address:
      {unknownAddressScanResult.payload && (
        <SecurityHint
          severity={unknownAddressScanResult.severity}
          text={`${unknownAddressScanResult.payload
            .map((recipient) => recipient.address)
            .join(', ')} is not present in your address book.`}
        />
      )}
      <SecurityWarning severity={unknownAddressScanResult.severity} />
      Unused Address:
      {unusedAddressScanResult.payload && (
        <SecurityHint
          severity={unusedAddressScanResult.severity}
          text={`${unusedAddressScanResult.payload
            .map((recipient) => recipient.address)
            .join(', ')} is has no code or balance.`}
        />
      )}
      <SecurityWarning severity={unusedAddressScanResult.severity} />
    </>
  )
}
