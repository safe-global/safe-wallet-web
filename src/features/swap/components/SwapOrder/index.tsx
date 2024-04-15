import OrderId from '@/features/swap/components/OrderId'
import StatusLabel from '@/features/swap/components/StatusLabel'
import { formatTimeInWords } from '@/utils/date'
import type { ReactElement } from 'react'
import Image from 'next/image'
import { type SwapOrder as SwapOrderType, type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import { DataRow } from '@/components/common/Table/DataRow'
import { DataTable } from '@/components/common/Table/DataTable'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'

type SwapOrderProps = {
  txData?: TransactionData
  txInfo?: SwapOrderType
}

const SellOrder = ({ order }: { order: SwapOrderType }) => {
  const {
    buyToken,
    sellToken,
    orderUid,
    expiresTimestamp,
    status,
    executionPriceLabel,
    limitPriceLabel,
    surplusLabel,
    explorerUrl,
  } = order

  return (
    <DataTable
      header="Sell order"
      rows={[
        <DataRow key="Amount" title="Amount">
          <div>
            <div>
              Sell{' '}
              <span className="value">
                {sellToken.logo && <Image src={sellToken.logo} alt={sellToken.symbol} width={32} height={32} />}{' '}
                {sellToken.amount} {sellToken.symbol}
              </span>
            </div>
            <div>
              For at least{' '}
              <span className="value">
                {buyToken.logo && <Image src={buyToken.logo} alt={buyToken.symbol} width={32} height={32} />}
                {buyToken.amount} {buyToken.symbol}
              </span>
            </div>
          </div>
        </DataRow>,
        <DataRow key="Execution price" title="Execution price">
          {executionPriceLabel}
        </DataRow>,
        <DataRow key="Limit price" title="Limit price">
          {limitPriceLabel}
        </DataRow>,
        <DataRow key="Surplus" title="Surplus">
          {surplusLabel}
        </DataRow>,
        <DataRow key="Expiry" title="Expiry">
          {formatTimeInWords(expiresTimestamp * 1000)}
        </DataRow>,
        <DataRow key="Order ID" title="Order ID">
          <OrderId orderId={orderUid} href={explorerUrl} />
        </DataRow>,
        <DataRow key="Status" title="Status">
          <StatusLabel status={status} />
        </DataRow>,
      ]}
    />
  )
}

export const SwapOrder = ({ txData, txInfo }: SwapOrderProps): ReactElement | null => {
  if (!txData || !txInfo) return null

  // ? when can a multiSend call take no parameters?
  if (!txData.dataDecoded?.parameters) {
    if (txData.hexData) {
      return <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
    }
    return null
  }

  return <SellOrder order={txInfo} />
}

export default SwapOrder
