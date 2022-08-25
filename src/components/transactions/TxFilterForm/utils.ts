import { safeParseUnits } from '@/utils/formatters'
import {
  TxFilterType,
  type IncomingTxFilter,
  type ModuleTxFilter,
  type OutgoingTxFilter,
  type TxFilter,
  type TxFilterFormState,
} from '@/components/transactions/TxFilterForm/types'

const getStandardFilter = ({
  execution_date__gte,
  execution_date__lte,
  value,
}: TxFilterFormState): Partial<IncomingTxFilter | OutgoingTxFilter> => {
  const getISOString = (date: string): string => new Date(date).toISOString()
  return {
    ...(execution_date__gte && { execution_date__gte: getISOString(execution_date__gte) }),
    ...(execution_date__lte && { execution_date__lte: getISOString(execution_date__lte) }),
    // TODO: Relevant to token decimals?
    ...(value && { value: safeParseUnits(value, 18)?.toString() }),
  }
}

export const _getIncomingFilter = (filter: TxFilterFormState): IncomingTxFilter => {
  const { token_address } = filter
  return {
    ...getStandardFilter(filter),
    ...(token_address && { token_address }),
  }
}

export const _getMultisigFilter = (filter: TxFilterFormState, executed = false): OutgoingTxFilter => {
  const { to, nonce } = filter
  return {
    ...getStandardFilter(filter),
    ...(to && { to }),
    ...(nonce && { nonce }),
    ...(executed && { executed: `${executed}` }),
  }
}

export const _getModuleFilter = ({ to, module }: TxFilterFormState): ModuleTxFilter => {
  return {
    ...(to && { to }),
    ...(module && { module }),
  }
}

export const getTxFilter = (data: TxFilterFormState): TxFilter => {
  switch (data.type) {
    case TxFilterType.INCOMING: {
      return _getIncomingFilter(data)
    }
    case TxFilterType.MULTISIG: {
      return _getMultisigFilter(data)
    }
    case TxFilterType.MODULE: {
      return _getModuleFilter(data)
    }
  }
}
