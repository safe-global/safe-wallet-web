import OrderId from '@/features/swap/components/OrderId'
import StatusLabel from '@/features/swap/components/StatusLabel'
import { formatDateTime, formatTimeInWords } from '@/utils/date'
import type { ReactElement } from 'react'
import Image from 'next/image'
import { type SwapOrder as SwapOrderType, type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import { DataRow } from '@/components/common/Table/DataRow'
import { DataTable } from '@/components/common/Table/DataTable'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { compareAsc } from 'date-fns'
import css from './styles.module.css'

type SwapOrderProps = {
  txData?: TransactionData
  txInfo?: SwapOrderType
}

export const SellOrder = ({ order }: { order: SwapOrderType }) => {
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

  const expires = new Date(expiresTimestamp * 1000)
  const now = new Date()

  return (
    <DataTable
      header="Sell order"
      rows={[
        <DataRow key="Amount" title="Amount">
          <div>
            <div>
              <span className={css.value}>
                Sell {sellToken.logo && <Image src={sellToken.logo} alt={sellToken.symbol} width={24} height={24} />}{' '}
                {sellToken.amount} {sellToken.symbol}
              </span>
            </div>
            <div>
              <span className={css.value}>
                For at least{' '}
                {buyToken.logo && <Image src={buyToken.logo} alt={buyToken.symbol} width={24} height={24} />}
                {buyToken.amount} {buyToken.symbol}
              </span>
            </div>
          </div>
        </DataRow>,
        status === 'fulfilled' ? (
          <DataRow key="Execution price" title="Execution price">
            {executionPriceLabel}
          </DataRow>
        ) : (
          <DataRow key="Limit price" title="Limit price">
            {limitPriceLabel}
          </DataRow>
        ),
        status === 'fulfilled' ? (
          <DataRow key="Surplus" title="Surplus">
            {surplusLabel}
          </DataRow>
        ) : (
          <></>
        ),
        compareAsc(now, expires) !== 1 ? (
          <DataRow key="Expiry" title="Expiry">
            {formatTimeInWords(expiresTimestamp * 1000)} ({formatDateTime(expiresTimestamp * 1000)})
          </DataRow>
        ) : (
          <DataRow key="Expiry" title="Expiry">
            {formatDateTime(expiresTimestamp * 1000)}
          </DataRow>
        ),
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
