import { type ReactElement } from 'react'
import ExternalLink from '@/components/common/ExternalLink'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getExplorerLink } from '@/utils/gateway'
import ErrorMessage from '../ErrorMessage'
import { isValidMasterCopy } from '@/services/contracts/safeContracts'

const UnknownContractError = (): ReactElement | null => {
  const { safe, safeAddress } = useSafeInfo()
  const currentChain = useCurrentChain()

  // Unsupported base contract
  const isUnknown = !isValidMasterCopy(safe.implementationVersionState)

  if (!isUnknown) return null

  return (
    <ErrorMessage>
      This Safe Account was created with an unsupported base contract. It should <b>ONLY</b> be used for fund recovery.
      Transactions will execute but the transaction list may not immediately update. Transaction success can be verified
      on the{' '}
      <ExternalLink href={currentChain ? getExplorerLink(safeAddress, currentChain.blockExplorerUriTemplate).href : ''}>
        {currentChain?.chainName} explorer
      </ExternalLink>
      .
    </ErrorMessage>
  )
}

export default UnknownContractError
