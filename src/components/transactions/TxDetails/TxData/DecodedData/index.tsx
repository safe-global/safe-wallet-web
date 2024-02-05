import type { ReactElement } from 'react'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { isCustomTxInfo } from '@/utils/transaction-guards'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import { useCowOrder } from '@/hooks/useDecodeTx'
import { sameAddress } from '@/utils/addresses'
import { formatVisualAmount } from '@/utils/formatters'
import { Typography } from '@mui/material'
import useBalances from '@/hooks/useBalances'

interface Props {
  txData: TransactionDetails['txData']
  txInfo: TransactionDetails['txInfo']
}

export const DecodedData = ({ txData, txInfo }: Props): ReactElement | null => {
  // Try to decode a CoW Order
  const [cowOrder] = useCowOrder({ data: txData?.hexData, value: txData?.value })
  const { balances } = useBalances()

  // nothing to render
  if (!txData) {
    return null
  }

  let decodedData = <></>
  if (txData.dataDecoded) {
    decodedData = <MethodDetails data={txData.dataDecoded} addressInfoIndex={txData.addressInfoIndex} />
  } else if (txData.hexData) {
    // When no decoded data, display raw hex data
    decodedData = <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
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

      {cowOrder && (
        <Typography>
          Swap{' '}
          <b>
            {formatVisualAmount(BigInt(cowOrder.sellAmount) + BigInt(cowOrder.feeAmount), 18)}{' '}
            {balances.items.find((item) => sameAddress(item.tokenInfo.address, cowOrder.sellToken))?.tokenInfo.symbol}
          </b>{' '}
          for{' '}
          <b>
            {formatVisualAmount(cowOrder.buyAmount, 18)}{' '}
            {balances.items.find((item) => sameAddress(item.tokenInfo.address, cowOrder.buyToken))?.tokenInfo.symbol}
          </b>
        </Typography>
      )}

      {decodedData}
    </>
  )
}

export default DecodedData
