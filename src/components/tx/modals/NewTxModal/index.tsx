import { useState } from 'react'
import type { ReactElement } from 'react'
import { useRouter } from 'next/router'

import TokenTransferModal from '../TokenTransferModal'
import RejectTxModal from '../RejectTxModal'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import { SendAssetsField } from '../TokenTransferModal/SendAssetsForm'
import CreationModal from './CreationModal'
import ReplacementModal from './ReplacementModal'
import { AppRoutes } from '@/config/routes'

const NewTxModal = ({
  onClose,
  recipient = '',
  txNonce,
}: {
  onClose: () => void
  recipient?: string
  txNonce?: number
}): ReactElement => {
  const router = useRouter()
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false)
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false)
  const isReplacement = txNonce !== undefined
  const showNftButton = router.pathname !== AppRoutes.balances.nfts

  // These cannot be Track components as they intefere with styling
  const onTokenModalOpen = () => {
    trackEvent(MODALS_EVENTS.SEND_FUNDS)
    setTokenModalOpen(true)
  }

  const onNFTModalOpen = () => {
    trackEvent(MODALS_EVENTS.SEND_COLLECTIBLE)
    router.push({
      pathname: AppRoutes.balances.nfts,
      query: { safe: router.query.safe },
    })
    onClose()
  }

  const onRejectModalOpen = () => {
    trackEvent(MODALS_EVENTS.REJECT_TX)
    setRejectModalOpen(true)
  }

  const onContractInteraction = () => {
    trackEvent(MODALS_EVENTS.CONTRACT_INTERACTION)
    onClose()
  }

  const sharedProps = {
    open: !tokenModalOpen,
    onClose,
    onTokenModalOpen,
  }

  return (
    <>
      {isReplacement ? (
        <ReplacementModal txNonce={txNonce} onRejectModalOpen={onRejectModalOpen} {...sharedProps} />
      ) : (
        <CreationModal
          shouldShowTxBuilder={!recipient}
          onNFTModalOpen={showNftButton ? onNFTModalOpen : undefined}
          onContractInteraction={onContractInteraction}
          {...sharedProps}
        />
      )}

      {tokenModalOpen && (
        <TokenTransferModal
          onClose={onClose}
          initialData={[{ [SendAssetsField.recipient]: recipient, disableSpendingLimit: isReplacement }, { txNonce }]}
        />
      )}

      {rejectModalOpen && typeof txNonce === 'number' ? (
        <RejectTxModal onClose={onClose} initialData={[txNonce]} />
      ) : null}
    </>
  )
}

export default NewTxModal
