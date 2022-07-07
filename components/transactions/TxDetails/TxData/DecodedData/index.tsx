import { ReactElement } from 'react'
import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { isCustomTxInfo, isDeleteAllowance, isMultisendTxInfo, isSetAllowance } from '@/utils/transaction-guards'
import { Multisend } from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { SpendingLimits } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'

interface Props {
  txData: TransactionDetails['txData']
  txInfo: TransactionDetails['txInfo']
}

export const DecodedData = ({ txData, txInfo }: Props): ReactElement | null => {
  // nothing to render
  if (!txData) {
    return null
  }

  // When not receiving decoded data, display it raw tx data
  if (!txData.dataDecoded) {
    if (!txData.hexData) {
      return null
    }

    return (
      <>
        <InfoDetails title="Interact with:">
          <EthHashInfo
            address={txData.to.value}
            name={isCustomTxInfo(txInfo) ? txInfo.to.name : undefined}
            customAvatar={isCustomTxInfo(txInfo) ? txInfo.to.logoUri || undefined : undefined}
          />
        </InfoDetails>
        <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
      </>
    )
  }

  if (isMultisendTxInfo(txInfo)) {
    return <Multisend txData={txData} />
  }

  const method = txData.dataDecoded?.method
  const isSpendingLimitMethod = isSetAllowance(method) || isDeleteAllowance(method)
  if (isSpendingLimitMethod && isCustomTxInfo(txInfo)) {
    return <SpendingLimits txData={txData} txInfo={txInfo} type={method} />
  }

  // we render the decoded data
  return (
    <>
      <InfoDetails title="Interact with:">
        <EthHashInfo
          address={txData.to.value}
          name={isCustomTxInfo(txInfo) ? txInfo.to.name : undefined}
          customAvatar={isCustomTxInfo(txInfo) ? txInfo.to.logoUri || undefined : undefined}
        />
      </InfoDetails>
      <MethodDetails data={txData.dataDecoded} />
    </>
  )
}

export default DecodedData
