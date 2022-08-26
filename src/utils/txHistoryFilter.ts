import { getIncomingTransfers, getModuleTransactions, getMultisigTransactions, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { operations } from '@gnosis.pm/safe-react-gateway-sdk/dist/types/api'
import { useRouter } from 'next/router'
import { type ParsedUrlQuery } from 'querystring'

export type IncomingTxFilter = operations['incoming_transfers']['parameters']['query']
export type MultisigTxFilter = operations['multisig_transactions']['parameters']['query']
export type ModuleTxFilter = operations['module_transactions']['parameters']['query']

export enum TxFilterType {
  INCOMING = 'Incoming',
  MULTISIG = 'Outgoing',
  MODULE = 'Module-based',
}

export type TxFilter = {
  type: TxFilterType,
  filter: IncomingTxFilter | MultisigTxFilter | ModuleTxFilter, // 1-to-1 CGW filter
}

// Spread TxFilter basically
type TxFilterUrlQuery = {
  type: TxFilter['type']
} & TxFilter['filter']

export const txFilter = {
  parseUrlQuery: (query: ParsedUrlQuery): TxFilter => {
    return {} as TxFilter
  }

  parseFormData: (formData: TxFilterFormState): TxFilter => {
    return {} as TxFilter
  }

  formatUrlQuery: (filter: TxFilter): TxFilterUrlQuery => {
  }

  formatFormData: (filter: TxFilter): TxFilterFormState => {
  }
}

export const getFilteredTxHistory = (
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
      return getMultisigTransactions(chainId, safeAddress, filterData.filter, pageUrl)
    }
    case TxFilterType.MODULE: {
      return getModuleTransactions(chainId, safeAddress, filterData.filter, pageUrl)
    }
  }
}

export const useTxFilter = (): [TxFilter, (filter: TxFilter | null) => void] => {
  const router = useRouter()
  const filter = txFilter.parseUrlQuery(router.query)

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
