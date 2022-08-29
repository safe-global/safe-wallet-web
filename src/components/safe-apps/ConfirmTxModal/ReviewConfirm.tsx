import { ReactElement } from 'react'

import { ConfirmTxModalProps } from '.'

type Props = ConfirmTxModalProps & {
  onReject: () => void
}

export const ReviewConfirm = ({
  app,
  txs,
  params,
  safeAddress,
  ethBalance,
  onUserConfirm,
  onClose,
  onReject,
  requestId,
  appId,
}: Props): ReactElement => {
  return <div>Transaction modal</div>
}
