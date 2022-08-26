import { useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  getIncomingTransfers,
  getModuleTransactions,
  getMultisigTransactions,
  type TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import type { operations } from '@gnosis.pm/safe-react-gateway-sdk/dist/types/api'
import type { ParsedUrlQuery } from 'querystring'

import { TxFilterFormState } from '@/components/transactions/TxFilterForm'
import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'

export type IncomingTxFilter = NonNullable<operations['incoming_transfers']['parameters']['query']>
export type MultisigTxFilter = NonNullable<operations['multisig_transactions']['parameters']['query']>
export type ModuleTxFilter = NonNullable<operations['module_transactions']['parameters']['query']>

export enum TxFilterType {
  INCOMING = 'Incoming',
  MULTISIG = 'Outgoing',
  MODULE = 'Module-based',
}

export type TxFilter = {
  type: TxFilterType
  filter: IncomingTxFilter | MultisigTxFilter | ModuleTxFilter // CGW filter
}

export const _sanitizeFilter = <T extends Record<string, unknown>>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => {
      return v !== '' && v != null
    }),
  ) as T
}

export const _isValidTxFilterType = (type: unknown) => {
  return !!type && Object.values(TxFilterType).includes(type as TxFilterType)
}

export const _isModuleFilter = (filter: TxFilter['filter']): filter is ModuleTxFilter => {
  return 'module' in filter
}

// Spread TxFilter basically
type TxFilterUrlQuery = {
  type: TxFilter['type']
} & TxFilter['filter']

export const txFilter = {
  parseUrlQuery: ({ type, ...filter }: ParsedUrlQuery): TxFilter | null => {
    if (!_isValidTxFilterType(type)) {
      return null
    }

    return {
      type: type as TxFilterType,
      filter: _sanitizeFilter(filter as TxFilter['filter']),
    }
  },

  parseFormData: ({ type, ...formData }: TxFilterFormState): TxFilter => {
    const filter = {
      ...formData,
      execution_date__gte: formData.execution_date__gte?.toISOString(),
      execution_date__lte: formData.execution_date__lte?.toISOString(),
      value: !_isModuleFilter(formData) && formData.value ? safeParseUnits(formData.value, 18)?.toString() : undefined,
    }

    return {
      type,
      filter: _sanitizeFilter(filter),
    }
  },

  formatUrlQuery: ({ type, filter }: TxFilter): TxFilterUrlQuery => {
    if (!_isValidTxFilterType(type)) {
      throw new Error('URL query contains and invalid `type`')
    }

    return {
      type,
      ..._sanitizeFilter(filter),
    }
  },

  formatFormData: ({ type, filter }: TxFilter): TxFilterFormState => {
    if (_isModuleFilter(filter)) {
      return {
        type,
        ...filter,
      }
    }

    const formData = {
      type: type || TxFilterType.INCOMING,
      ...filter,
      execution_date__gte: filter.execution_date__gte ? new Date(filter.execution_date__gte) : undefined,
      execution_date__lte: filter.execution_date__lte ? new Date(filter.execution_date__lte) : undefined,
      value: filter.value ? safeFormatUnits(filter.value, 18)?.toString() : undefined,
    }

    return _sanitizeFilter(formData)
  },
}

export const useTxFilter = (): [TxFilter | null, (filter: TxFilter | null) => void] => {
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
