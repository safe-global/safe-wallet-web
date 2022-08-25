import { safeParseUnits } from '@/utils/formatters'
import {
  TxFilterType,
  type IncomingTxFilter,
  type ModuleTxFilter,
  type MultisigTxFilter,
  type TxFilterFormState,
  type TxFilterQuery,
} from '@/components/transactions/TxFilterForm/types'
import { isDate, isString, omit } from 'lodash'
import { ParsedUrlQuery } from 'querystring'
import { TxFilterFormFieldNames } from '.'
import { getIncomingTransfers, getMultisigTransactions, getModuleTransactions } from '@gnosis.pm/safe-react-gateway-sdk'

const TX_FILTER_FIELD_NAMES = Object.values(TxFilterFormFieldNames)
const TX_FILTER_TYPES = Object.values(TxFilterType)

export const _hasTxFilterType = <T extends ParsedUrlQuery | TxFilterFormState>(
  query: T,
): query is T & { [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: TxFilterType } => {
  const type = query[TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]
  return isString(type) && TX_FILTER_TYPES.includes(type as TxFilterType)
}

export const hasTxFilterQuery = (query: ParsedUrlQuery): boolean => {
  return (
    _hasTxFilterType(query) &&
    Object.keys(query).some((key) => isString(key) && TX_FILTER_FIELD_NAMES.includes(key as TxFilterFormFieldNames))
  )
}

export const getFilterlessQuery = (query: ParsedUrlQuery): ParsedUrlQuery => {
  return omit(query, TX_FILTER_FIELD_NAMES)
}

export const _isString = (value: unknown): value is string => {
  return isString(value) && value.length > 0
}

export const _getISOString = (date: Date | string): string => {
  return isDate(date) ? date.toISOString() : new Date(date).toISOString()
}

const getStandardFilter = ({
  execution_date__gte,
  execution_date__lte,
  value,
}: TxFilterFormState | ParsedUrlQuery): Partial<IncomingTxFilter | MultisigTxFilter> => {
  return {
    ...((_isString(execution_date__gte) || isDate(execution_date__gte)) && {
      execution_date__gte: _getISOString(execution_date__gte),
    }),
    ...((_isString(execution_date__lte) || isDate(execution_date__lte)) && {
      execution_date__lte: _getISOString(execution_date__lte),
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
    case TxFilterType.INCOMING: {
      return _getIncomingFilter(data)
    }
    case TxFilterType.MULTISIG: {
      // We only filter historical transactions, therefore `true`
      return _getMultisigFilter(data, true)
    }
    case TxFilterType.MODULE: {
      return _getModuleFilter(data)
    }
  }
}

// TODO: Test
export const getTxFilterQuery = (data: TxFilterFormState | ParsedUrlQuery): TxFilterQuery | undefined => {
  if (!_hasTxFilterType(data)) {
    return undefined
  }

  return {
    [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: data[TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME],
    ...getTxFilter(data),
  }
}

// TODO: Test
export const getFilteredTxHistory = (chainId: string, safeAddress: string, query: ParsedUrlQuery, pageUrl?: string) => {
  const filter = getTxFilter(query)

  switch (query[TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]) {
    case TxFilterType.INCOMING: {
      return getIncomingTransfers(chainId, safeAddress, filter, pageUrl)
    }
    case TxFilterType.MULTISIG: {
      return getMultisigTransactions(chainId, safeAddress, filter, pageUrl)
    }
    case TxFilterType.MODULE: {
      return getModuleTransactions(chainId, safeAddress, filter, pageUrl)
    }
  }
}
