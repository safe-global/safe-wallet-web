import { ReactElement } from 'react'
import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { isMultisendTxInfo } from '@/utils/transaction-guards'
import { Multisend } from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'

interface Props {
  txData: TransactionDetails['txData']
  txInfo: TransactionDetails['txInfo']
}

export const DecodedData = ({ txData, txInfo }: Props): ReactElement | null => {
  // nothing to render
  if (!txData) {
    return null
  }

  if (isMultisendTxInfo(txInfo)) {
    return <Multisend txData={txData} />
  }

  // TODO: we render the decoded data
  return <></>
}

export default DecodedData
