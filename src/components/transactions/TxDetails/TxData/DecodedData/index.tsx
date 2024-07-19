import type { ReactElement } from 'react'
import { Stack } from '@mui/material'
import { TokenType, type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'

import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import { useCurrentChain } from '@/hooks/useChains'
import SendAmountBlock from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { isCustomTxInfo } from '@/utils/transaction-guards'
import MethodCall from './MethodCall'

interface Props {
  txData: TransactionDetails['txData']
  txInfo?: TransactionDetails['txInfo']
}

export const DecodedData = ({ txData, txInfo }: Props): ReactElement | null => {
  const chainInfo = useCurrentChain()
  // nothing to render
  if (!txData) {
    return null
  }

  const method = txData.dataDecoded?.method || ''
  const addressInfo =
    (txInfo && isCustomTxInfo(txInfo) ? txInfo.to : undefined) || txData.addressInfoIndex?.[txData.to.value]

  let decodedData = <></>
  if (txData.dataDecoded) {
    decodedData = <MethodDetails data={txData.dataDecoded} addressInfoIndex={txData.addressInfoIndex} />
  } else if (txData.hexData) {
    // When no decoded data, display raw hex data
    decodedData = <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
  }

  const amountInWei = txData.value ?? '0'
  // we render the decoded data
  return (
    <Stack spacing={1}>
      {amountInWei !== '0' && (
        <SendAmountBlock
          amountInWei={amountInWei}
          tokenInfo={{
            type: TokenType.NATIVE_TOKEN,
            address: ZERO_ADDRESS,
            decimals: chainInfo?.nativeCurrency.decimals ?? 18,
            symbol: chainInfo?.nativeCurrency.symbol ?? 'ETH',
            logoUri: chainInfo?.nativeCurrency.logoUri,
          }}
        />
      )}

      <MethodCall
        contractAddress={txData.to.value}
        contractName={addressInfo?.name}
        contractLogo={addressInfo?.logoUri}
        method={method}
      />

      {decodedData}
    </Stack>
  )
}

export default DecodedData
