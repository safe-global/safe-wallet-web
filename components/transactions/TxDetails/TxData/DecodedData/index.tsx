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

  // // unknown tx information
  // if (!txData.dataDecoded) {
  //   // no hex data, nothing to render
  //   if (!txData.hexData) {
  //     return null
  //   }

  //   // we render the hex encoded data
  //   return (
  //     <DetailsWithTxInfo txData={txData} txInfo={txInfo}>
  //       <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
  //     </DetailsWithTxInfo>
  //   )
  // }

  // // known data and particularly `multiSend` data type
  // if (sameString(txData.dataDecoded.method, 'multiSend')) {
  //   return <MultiSendDetails txData={txData} />
  // }

  if (isMultisendTxInfo(txInfo)) {
    return <Multisend txData={txData} />
  }
  // // FixMe: this way won't scale well
  // if (isSetAllowance(txData.dataDecoded.method)) {
  //   return <ModifySpendingLimitDetails txData={txData} txInfo={txInfo} />
  // }

  // // FixMe: this way won't scale well
  // if (isDeleteAllowance(txData.dataDecoded.method)) {
  //   return <DeleteSpendingLimitDetails txData={txData} txInfo={txInfo} />
  // }

  // we render the decoded data
  return (
    <></>
    // <DetailsWithTxInfo txData={txData} txInfo={txInfo}>
    //   <MethodDetails data={txData.dataDecoded} />
    // </DetailsWithTxInfo>
  )
}

export default DecodedData
