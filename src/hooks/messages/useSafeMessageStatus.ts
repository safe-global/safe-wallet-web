import { SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import useIsSafeMessagePending from './useIsSafeMessagePending'
import useWallet from '../wallets/useWallet'

const ConfirmingStatus = 'CONFIRMING'
const AwaitingConfirmationsStatus = 'AWAITING_CONFIRMATIONS'

type SafeMessageLocalStatus = SafeMessageStatus | typeof ConfirmingStatus | typeof AwaitingConfirmationsStatus

const STATUS_LABELS: { [key in SafeMessageLocalStatus]: string } = {
  [ConfirmingStatus]: 'Confirming',
  [AwaitingConfirmationsStatus]: 'Awaiting confirmations',
  [SafeMessageStatus.CONFIRMED]: 'Confirmed',
  [SafeMessageStatus.NEEDS_CONFIRMATION]: 'Needs confirmation',
}

const useSafeMessageStatus = (msg: SafeMessage) => {
  const isPending = useIsSafeMessagePending(msg.messageHash)
  const wallet = useWallet()

  if (isPending) {
    return STATUS_LABELS[ConfirmingStatus]
  }

  const hasWalletSigned = wallet && msg.confirmations.some(({ owner }) => owner.value === wallet.address)
  const isConfirmed = msg.status === SafeMessageStatus.CONFIRMED
  if (hasWalletSigned && !isConfirmed) {
    return STATUS_LABELS[AwaitingConfirmationsStatus]
  }

  return STATUS_LABELS[msg.status]
}

export default useSafeMessageStatus
