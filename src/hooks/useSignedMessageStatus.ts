import { SignedMessageStatus } from '@/store/signedMessagesSlice'
import type { SignedMessage } from '@/store/signedMessagesSlice'
import useIsSignedMessagePending from './useIsSignedMessagePending'
import useWallet from './wallets/useWallet'

const ConfirmingStatus = 'CONFIRMING'
const AwaitingConfirmationsStatus = 'AWAITING_CONFIRMATIONS'

type SignedMessageLocalStatus = SignedMessageStatus | typeof ConfirmingStatus | typeof AwaitingConfirmationsStatus

const STATUS_LABELS: { [key in SignedMessageLocalStatus]: string } = {
  [ConfirmingStatus]: 'Confirming',
  [AwaitingConfirmationsStatus]: 'Awaiting confirmations',
  [SignedMessageStatus.CONFIRMED]: 'Confirmed',
  [SignedMessageStatus.NEEDS_CONFIRMATION]: 'Needs confirmation',
}

const useSignedMessageStatus = (msg: SignedMessage) => {
  const isPending = useIsSignedMessagePending(msg.messageHash)
  const wallet = useWallet()

  if (isPending) {
    return STATUS_LABELS[ConfirmingStatus]
  }

  const hasWalletSigned = wallet && msg.confirmations.some(({ owner }) => owner.value === wallet.address)
  const isConfirmed = msg.status === SignedMessageStatus.CONFIRMED
  if (hasWalletSigned && !isConfirmed) {
    return STATUS_LABELS[AwaitingConfirmationsStatus]
  }

  return STATUS_LABELS[msg.status]
}

export default useSignedMessageStatus
