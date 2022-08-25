import type { operations } from '@gnosis.pm/safe-react-gateway-sdk/dist/types/api'

import { TxFilterFormFieldNames } from '@/components/transactions/TxFilterForm'

export type IncomingTxFilter = NonNullable<operations['incoming_transfers']['parameters']['query']>
export type MultisigTxFilter = NonNullable<operations['multisig_transactions']['parameters']['query']>
export type ModuleTxFilter = NonNullable<operations['module_transactions']['parameters']['query']>

export enum TxFilterType {
  INCOMING = 'Incoming',
  MULTISIG = 'Outgoing',
  MODULE = 'Module-based',
}

export type TxFilterFormState = {
  [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: TxFilterType
} & Omit<
  // The filter form uses a <DatePicker> whose value is of `Date` | `null`
  IncomingTxFilter & MultisigTxFilter & ModuleTxFilter,
  `${TxFilterFormFieldNames.DATE_FROM_FIELD_NAME}` | `${TxFilterFormFieldNames.DATE_TO_FIELD_NAME}`
> & {
    [TxFilterFormFieldNames.DATE_FROM_FIELD_NAME]: Date | null
    [TxFilterFormFieldNames.DATE_TO_FIELD_NAME]: Date | null
  }

type TxFilter = IncomingTxFilter | MultisigTxFilter | ModuleTxFilter

export type TxFilterQuery = TxFilter & {
  [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: TxFilterType
}
