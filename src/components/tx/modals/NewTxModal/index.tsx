import { useState } from 'react'
import type { ReactElement } from 'react'

import TokenTransferModal from '../TokenTransferModal'
import RejectTxModal from '../RejectTxModal'
import NftTransferModal from '../NftTransferModal'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import { SendAssetsField } from '../TokenTransferModal/SendAssetsForm'
import CreationModal from './CreationModal'
import ReplacementModal from './ReplacementModal'

const NewTxModal = ({
  onClose,
  recipient = '',
  txNonce,
}: {
  onClose: () => void
  recipient?: string
  txNonce?: number
}): ReactElement => {
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false)
  const [nftsModalOpen, setNftModalOpen] = useState<boolean>(false)
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false)
  const isReplacement = txNonce !== undefined

  // These cannot be Track components as they intefere with styling
  const onTokenModalOpen = () => {
    trackEvent(MODALS_EVENTS.SEND_FUNDS)
    setTokenModalOpen(true)
  }

  const onNFTModalOpen = () => {
    trackEvent(MODALS_EVENTS.SEND_COLLECTIBLE)
    setNftModalOpen(true)
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
    open: !tokenModalOpen && !nftsModalOpen,
    onClose,
    onTokenModalOpen,
    onNFTModalOpen,
  }

  return (
    <>
      {isReplacement ? (
        <ReplacementModal txNonce={txNonce} onRejectModalOpen={onRejectModalOpen} {...sharedProps} />
      ) : (
        <CreationModal
          shouldShowTxBuilder={!recipient}
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

      {nftsModalOpen && <NftTransferModal onClose={onClose} initialData={[{ recipient }, { txNonce }]} />}

      {rejectModalOpen && typeof txNonce === 'number' ? (
        <RejectTxModal onClose={onClose} initialData={[txNonce]} />
      ) : null}
    </>
  )
}

export default NewTxModal
