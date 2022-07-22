import { ReactElement } from 'react'
import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import {
  isCustomTxInfo,
  isMultiSendTxInfo,
  isSpendingLimitMethod,
  isSupportedMultiSendAddress,
  isSupportedSpendingLimitAddress,
  SpendingLimitMethods,
} from '@/utils/transaction-guards'
import { Multisend } from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { SpendingLimits } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import useChainId from '@/hooks/useChainId'

interface Props {
  txData: TransactionDetails['txData']
  txInfo: TransactionDetails['txInfo']
}

export const DecodedData = ({ txData, txInfo }: Props): ReactElement | null => {
  const chainId = useChainId()
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
            customAvatar={isCustomTxInfo(txInfo) ? txInfo.to.logoUri : undefined}
            shortAddress={false}
            showCopyButton
            hasExplorer
          />
        </InfoDetails>
        <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
      </>
    )
  }

  if (isSupportedMultiSendAddress(txInfo, chainId) && isMultiSendTxInfo(txInfo)) {
    return <Multisend txData={txData} />
  }

  const method = txData.dataDecoded.method as SpendingLimitMethods
  if (isSupportedSpendingLimitAddress(txInfo, chainId) && isSpendingLimitMethod(method) && isCustomTxInfo(txInfo)) {
    return <SpendingLimits txData={txData} txInfo={txInfo} type={method} />
  }

  // we render the decoded data
  return (
    <>
      <InfoDetails title="Interact with:">
        <EthHashInfo
          address={txData.to.value}
          name={isCustomTxInfo(txInfo) ? txInfo.to.name : undefined}
          customAvatar={isCustomTxInfo(txInfo) ? txInfo.to.logoUri : undefined}
          shortAddress={false}
          showCopyButton
          hasExplorer
        />
      </InfoDetails>
      <MethodDetails data={txData.dataDecoded} />
    </>
  )
}

export default DecodedData
