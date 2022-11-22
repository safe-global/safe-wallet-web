import { MessageStatus } from '@/store/msgsSlice'
import type { Message } from '@/store/msgsSlice'
import useIsMsgPending from './useIsMsgPending'
import useWallet from './wallets/useWallet'

const ConfirmingStatus = 'CONFIRMING'
const AwaitingConfirmationsStatus = 'AWAITING_CONFIRMATIONS'

type MsgLocalStatus = MessageStatus | typeof ConfirmingStatus | typeof AwaitingConfirmationsStatus

const STATUS_LABELS: { [key in MsgLocalStatus]: string } = {
  [ConfirmingStatus]: 'Confirming',
  [AwaitingConfirmationsStatus]: 'Awaiting confirmations',
  [MessageStatus.CONFIRMED]: 'Confirmed',
  [MessageStatus.NEEDS_CONFIRMATION]: 'Needs confirmation',
}

const useMessageStatus = (msg: Message) => {
  const isPending = useIsMsgPending(msg.messageHash)
  const wallet = useWallet()

  if (isPending) {
    return STATUS_LABELS[ConfirmingStatus]
  }

  const hasWalletSigned = wallet && msg.confirmations.some(({ owner }) => owner.value === wallet.address)
  if (hasWalletSigned) {
    return STATUS_LABELS[AwaitingConfirmationsStatus]
  }

  return STATUS_LABELS[msg.status]
}

export default useMessageStatus
