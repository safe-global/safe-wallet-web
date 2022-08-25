import type { operations } from '@gnosis.pm/safe-react-gateway-sdk/dist/types/api'

import { FILTER_TYPE_FIELD_NAME } from '@/components/transactions/TxFilterForm'

export type IncomingTxFilter = operations['incoming_transfers']['parameters']['query']
export type OutgoingTxFilter = operations['multisig_transactions']['parameters']['query']
export type ModuleTxFilter = operations['module_transactions']['parameters']['query']

export type TxFilter = IncomingTxFilter | OutgoingTxFilter | ModuleTxFilter

export enum TxFilterType {
  INCOMING = 'Incoming',
  MULTISIG = 'Outgoing',
  MODULE = 'Module-based',
}

export type TxFilterFormState = {
  [FILTER_TYPE_FIELD_NAME]: TxFilterType
} & IncomingTxFilter &
  OutgoingTxFilter &
  ModuleTxFilter
