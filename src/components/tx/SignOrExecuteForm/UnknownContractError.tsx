import { type ReactElement } from 'react'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import ExternalLink from '@/components/common/ExternalLink'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getExplorerLink } from '@/utils/gateway'
import ErrorMessage from '../ErrorMessage'

const UnknownContractError = (): ReactElement | null => {
  const { safe, safeAddress } = useSafeInfo()
  const currentChain = useCurrentChain()

  // Unsupported base contract
  const isUnknown = safe.implementationVersionState === ImplementationVersionState.UNKNOWN

  if (!isUnknown) return null

  return (
    <ErrorMessage>
      This Safe was created with an unsupported base contract. It should <b>ONLY</b> be used for fund recovery.
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
