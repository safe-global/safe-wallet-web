import { isDate, isString, omit } from 'lodash'
import {
  getIncomingTransfers,
  getMultisigTransactions,
  getModuleTransactions,
  type TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import type { ParsedUrlQuery } from 'querystring'

import { safeParseUnits } from '@/utils/formatters'
import {
  TxFilterFormType,
  TxFilterFormFieldNames,
  type TxFilterFormState,
} from '@/components/transactions/TxFilterForm'
import type { operations } from '@gnosis.pm/safe-react-gateway-sdk/dist/types/api'

// Types

export type IncomingTxFilter = NonNullable<operations['incoming_transfers']['parameters']['query']>
export type MultisigTxFilter = NonNullable<operations['multisig_transactions']['parameters']['query']>
export type ModuleTxFilter = NonNullable<operations['module_transactions']['parameters']['query']>

type TxFilter = IncomingTxFilter | MultisigTxFilter | ModuleTxFilter

export type TxFilterQuery = TxFilter & {
  [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: TxFilterFormType
}

// Utils

const TX_FILTER_FIELD_NAMES = Object.values(TxFilterFormFieldNames)
const TX_FILTER_TYPES = Object.values(TxFilterFormType)

export const _hasTxFilterType = <T extends ParsedUrlQuery | TxFilterFormState>(
  query: T,
): query is T & { [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: TxFilterFormType } => {
  const type = query[TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]
  return isString(type) && TX_FILTER_TYPES.includes(type as TxFilterFormType)
}

export const hasTxFilterQuery = (query: ParsedUrlQuery): boolean => {
  return (
    _hasTxFilterType(query) &&
    Object.keys(query).some((key) => isString(key) && TX_FILTER_FIELD_NAMES.includes(key as TxFilterFormFieldNames))
  )
}

export const omitFilterQuery = (query: ParsedUrlQuery): ParsedUrlQuery => {
  return omit(query, TX_FILTER_FIELD_NAMES)
}

export const _isString = (value: unknown): value is string => {
  return isString(value) && value.length > 0
}

export const _getDateISO = (date: Date | string): string => {
  return isDate(date) ? date.toISOString() : new Date(date).toISOString()
}

const getStandardFilter = ({
  execution_date__gte,
  execution_date__lte,
  value,
}: TxFilterFormState | ParsedUrlQuery): Partial<IncomingTxFilter | MultisigTxFilter> => {
  return {
    ...((_isString(execution_date__gte) || isDate(execution_date__gte)) && {
      execution_date__gte: _getDateISO(execution_date__gte),
    }),
    ...((_isString(execution_date__lte) || isDate(execution_date__lte)) && {
      execution_date__lte: _getDateISO(execution_date__lte),
    }),
    // TODO: Relevant to token decimals?
    ...(_isString(value) && { value: safeParseUnits(value, 18)?.toString() }),
  }
}

export const _getIncomingFilter = (filter: TxFilterFormState | ParsedUrlQuery): IncomingTxFilter => {
  const { token_address } = filter
  return {
    ...getStandardFilter(filter),
    ...(_isString(token_address) && { token_address }),
  }
}

export const _getMultisigFilter = (filter: TxFilterFormState | ParsedUrlQuery, executed = false): MultisigTxFilter => {
  const { to, nonce } = filter
  return {
    ...getStandardFilter(filter),
    ...(_isString(to) && { to }),
    ...(_isString(nonce) && { nonce }),
    ...(executed && { executed: `${executed}` }),
  }
}

export const _getModuleFilter = ({ to, module }: TxFilterFormState | ParsedUrlQuery): ModuleTxFilter => {
  return {
    ...(_isString(to) && { to }),
    ...(_isString(module) && { module }),
  }
}

const getTxFilter = (
  data: TxFilterFormState | ParsedUrlQuery,
): IncomingTxFilter | MultisigTxFilter | ModuleTxFilter | undefined => {
  switch (data.type) {
    case TxFilterFormType.INCOMING: {
      return _getIncomingFilter(data)
    }
    case TxFilterFormType.MULTISIG: {
      // We only filter historical transactions, therefore `true`
      return _getMultisigFilter(data, true)
    }
    case TxFilterFormType.MODULE: {
      return _getModuleFilter(data)
    }
  }
}

export const getTxFilterQuery = (data: TxFilterFormState | ParsedUrlQuery): TxFilterQuery | undefined => {
  if (!_hasTxFilterType(data)) {
    return undefined
  }

  return {
    [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: data[TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME],
    ...getTxFilter(data),
  }
}

export const getFilteredTxHistory = (
  chainId: string,
  safeAddress: string,
  query: ParsedUrlQuery,
  pageUrl?: string,
): Promise<TransactionListPage> | undefined => {
  const filter = getTxFilter(query)

  switch (query[TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]) {
    case TxFilterFormType.INCOMING: {
      return getIncomingTransfers(chainId, safeAddress, filter, pageUrl)
    }
    case TxFilterFormType.MULTISIG: {
      return getMultisigTransactions(chainId, safeAddress, filter, pageUrl)
    }
    case TxFilterFormType.MODULE: {
      return getModuleTransactions(chainId, safeAddress, filter, pageUrl)
    }
  }
}
