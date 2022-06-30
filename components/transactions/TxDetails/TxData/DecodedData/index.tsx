import { ReactElement } from 'react'
import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { isCustomTxInfo, isMultisendTxInfo, isSetAllowance } from '@/utils/transaction-guards'
import { MethodDetails, Multisend } from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import { InfoDetails } from '@/components/transactions/TxDetails/TxData/SettingsChange'
import { AddressInfo } from '@/components/transactions/TxDetails/TxData'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { SetAllowance } from '@/components/transactions/TxDetails/TxData/SpendingLimits/SetAllowance'

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
          <AddressInfo
            address={txData.to.value}
            name={isCustomTxInfo(txInfo) ? txInfo.to.name : undefined}
            avatarUrl={isCustomTxInfo(txInfo) ? txInfo.to.logoUri : undefined}
          />
        </InfoDetails>
        <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
      </>
    )
  }

  if (isMultisendTxInfo(txInfo)) {
    return <Multisend txData={txData} />
  }

  if (isSetAllowance(txData.dataDecoded.method) && isCustomTxInfo(txInfo)) {
    return <SetAllowance txData={txData} txInfo={txInfo} />
  }

  // // FixMe: this way won't scale well
  // if (isDeleteAllowance(txData.dataDecoded.method)) {
  //   return <DeleteSpendingLimitDetails txData={txData} txInfo={txInfo} />
  // }

  // we render the decoded data
  return (
    <>
      <InfoDetails title="Interact with:">
        <AddressInfo
          address={txData.to.value}
          name={isCustomTxInfo(txInfo) ? txInfo.to.name : undefined}
          avatarUrl={isCustomTxInfo(txInfo) ? txInfo.to.logoUri : undefined}
        />
      </InfoDetails>
      <MethodDetails data={txData.dataDecoded} />
    </>
  )
}

export default DecodedData
