import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'

export type NarrowConfirmationViewProps = {
  txDetails: TransactionDetails
  txInfo: TransactionDetails['txInfo']
}
