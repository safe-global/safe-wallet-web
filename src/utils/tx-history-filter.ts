import { useRouter } from 'next/router'
import { isString, isDate } from 'lodash'
import {
  getIncomingTransfers,
  getModuleTransactions,
  getMultisigTransactions,
  type TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import type { operations } from '@gnosis.pm/safe-react-gateway-sdk/dist/types/api'
import type { ParsedUrlQuery } from 'querystring'

import { TxFilterFormState } from '@/components/transactions/TxFilterForm'
import { safeParseUnits } from '@/utils/formatters'
import { useMemo } from 'react'

export type IncomingTxFilter = operations['incoming_transfers']['parameters']['query']
export type MultisigTxFilter = operations['multisig_transactions']['parameters']['query']
export type ModuleTxFilter = operations['module_transactions']['parameters']['query']

export enum TxFilterType {
  INCOMING = 'Incoming',
  MULTISIG = 'Outgoing',
  MODULE = 'Module-based',
}

export type TxFilter = {
  type: TxFilterType | null
  filter: IncomingTxFilter | MultisigTxFilter | ModuleTxFilter // CGW filter
}

// Spread TxFilter basically
type TxFilterUrlQuery = {
  type: TxFilter['type']
} & TxFilter['filter']

export const _getDateISO = (date: Date | string): string => {
  return isDate(date) ? date.toISOString() : new Date(date).toISOString()
}

/**
 * Parses for URL query filters, which can be of string | string[] or undefined
 * We use `isString` to typeguard the filter as if they are of string type they
 * have at least .length > 1
 */

export const parseIncomingFilterUrlQuery = ({
  execution_date__gte,
  execution_date__lte,
  value,
  token_address,
}: ParsedUrlQuery): IncomingTxFilter => {
  const filter = {
    ...(isString(execution_date__gte) && {
      execution_date__gte: _getDateISO(execution_date__gte),
    }),
    ...(isString(execution_date__lte) && {
      execution_date__lte: _getDateISO(execution_date__lte),
    }),
    // TODO: Relevant to token decimals?
    ...(isString(value) && { value: safeParseUnits(value, 18)?.toString() }),
    ...(isString(token_address) && { token_address }),
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

export const parseMultisigFilterUrlQuery = ({
  execution_date__gte,
  execution_date__lte,
  value,
  to,
  nonce,
  executed,
}: ParsedUrlQuery): MultisigTxFilter => {
  const filter = {
    ...(isString(execution_date__gte) && {
      execution_date__gte: _getDateISO(execution_date__gte),
    }),
    ...(isString(execution_date__lte) && {
      execution_date__lte: _getDateISO(execution_date__lte),
    }),
    // TODO: Relevant to token decimals?
    ...(isString(value) && { value: safeParseUnits(value, 18)?.toString() }),
    ...(isString(to) && { to }),
    ...(isString(nonce) && { nonce }),
    ...(isString(executed) && { executed }),
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

export const parseModuleFilterUrlQuery = ({ to, module }: ParsedUrlQuery): MultisigTxFilter => {
  const filter = {
    ...(isString(to) && { to }),
    ...(isString(module) && { module }),
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

/**
 * Parses for form filters. We ensure that string values have at least 1 character
 * and convert Date objects to ISO strings
 */

export const isDirty = (value: unknown): value is string => {
  return isString(value) && value.length > 0
}

export const parseIncomingFilterFormData = ({
  execution_date__gte,
  execution_date__lte,
  value,
  token_address,
}: TxFilterFormState): IncomingTxFilter => {
  const filter = {
    ...(isDate(execution_date__gte) && {
      execution_date__gte: _getDateISO(execution_date__gte),
    }),
    ...(isDate(execution_date__lte) && {
      execution_date__lte: _getDateISO(execution_date__lte),
    }),
    // TODO: Relevant to token decimals?
    ...(isDirty(value) && { value: safeParseUnits(value, 18)?.toString() }),
    ...(isDirty(token_address) && { token_address }),
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

export const parseMultisigFilterFormData = ({
  execution_date__gte,
  execution_date__lte,
  value,
  to,
  nonce,
}: TxFilterFormState): MultisigTxFilter => {
  const filter = {
    ...(isDate(execution_date__gte) && {
      execution_date__gte: _getDateISO(execution_date__gte),
    }),
    ...(isDate(execution_date__lte) && {
      execution_date__lte: _getDateISO(execution_date__lte),
    }),
    // TODO: Relevant to token decimals?
    ...(isDirty(value) && { value: safeParseUnits(value, 18)?.toString() }),
    ...(isDirty(to) && { to }),
    ...(isDirty(nonce) && { nonce }),
    // There is no `executed` field in the form
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

export const parseModuleFilterFormData = ({ to, module }: TxFilterFormState): MultisigTxFilter => {
  const filter = {
    ...(isDirty(to) && { to }),
    ...(isDirty(module) && { module }),
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

export const txFilter = {
  parseUrlQuery: (query: ParsedUrlQuery): TxFilter => {
    switch (query.type) {
      case TxFilterType.INCOMING: {
        return {
          type: TxFilterType.INCOMING,
          filter: parseIncomingFilterUrlQuery(query),
        }
      }
      case TxFilterType.MULTISIG: {
        return {
          type: TxFilterType.MULTISIG,
          filter: parseMultisigFilterUrlQuery(query),
        }
      }
      case TxFilterType.MODULE: {
        return {
          type: TxFilterType.MODULE,
          filter: parseModuleFilterUrlQuery(query),
        }
      }
      default: {
        return {
          type: null,
          filter: undefined,
        }
      }
    }
  },

  parseFormData: (formData: TxFilterFormState): TxFilter => {
    switch (formData.type) {
      case TxFilterType.INCOMING: {
        return {
          type: TxFilterType.INCOMING,
          filter: parseIncomingFilterFormData(formData),
        }
      }
      case TxFilterType.MULTISIG: {
        return {
          type: TxFilterType.MULTISIG,
          filter: parseMultisigFilterFormData(formData),
        }
      }
      case TxFilterType.MODULE: {
        return {
          type: TxFilterType.MODULE,
          filter: parseModuleFilterFormData(formData),
        }
      }
      // No default required as form *always* has a `type`
    }
  },

  formatUrlQuery: ({ type, filter }: TxFilter): TxFilterUrlQuery => {
    if (!type) {
      throw new Error('URL query contains no transaction filter `type`')
    }

    return {
      type,
      ...filter,
    }
  },

  formatFormData: ({ type, filter }: TxFilter): Partial<TxFilterFormState> => {
    return {
      type: type || TxFilterType.INCOMING,
      ...filter,
    }
  },
}

export const useTxFilter = (): [TxFilter, (filter: TxFilter | null) => void] => {
  const router = useRouter()
  const filter = useMemo(() => txFilter.parseUrlQuery(router.query), [router.query])

  const setQuery = (filter: TxFilter | null) => {
    router.push({
      pathname: router.pathname,
      query: {
        safe: router.query.safe,
        ...(filter && txFilter.formatUrlQuery(filter)),
      },
    })
  }

  return [filter, setQuery]
}

export const fetchFilteredTxHistory = (
  chainId: string,
  safeAddress: string,
  filterData: TxFilter,
  pageUrl?: string,
): Promise<TransactionListPage> | undefined => {
  switch (filterData.type) {
    case TxFilterType.INCOMING: {
      return getIncomingTransfers(chainId, safeAddress, filterData.filter, pageUrl)
    }
    case TxFilterType.MULTISIG: {
      const filter = {
        ...filterData.filter,
        // We only filter historical transactions
        executed: 'true',
      }

      return getMultisigTransactions(chainId, safeAddress, filter, pageUrl)
    }
    case TxFilterType.MODULE: {
      return getModuleTransactions(chainId, safeAddress, filterData.filter, pageUrl)
    }
  }
}
