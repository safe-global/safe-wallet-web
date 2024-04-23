import OrderId from '@/features/swap/components/OrderId'
import StatusLabel from '@/features/swap/components/StatusLabel'
import { capitalize } from '@/hooks/useMnemonicName'
import { formatDateTime, formatTimeInWords } from '@/utils/date'
import type { ReactElement } from 'react'
import { DataRow } from '@/components/common/Table/DataRow'
import { DataTable } from '@/components/common/Table/DataTable'
import { compareAsc } from 'date-fns'
import { Typography } from '@mui/material'
import { formatAmount } from '@/utils/formatNumber'
import { formatVisualAmount } from '@/utils/formatters'
import { getExecutionPrice, getLimitPrice, getSurplusPrice } from '@/features/swap/helpers/utils'
import type { CowSwapConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import SwapTokens from '@/features/swap/components/SwapTokens'

type SwapOrderProps = {
  order: CowSwapConfirmationView
}

const Order = ({ order }: SwapOrderProps) => {
  const {
    uid,
    kind,
    validUntil,
    status,
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    executedSellAmount,
    executedBuyAmount,
    explorerUrl,
  } = order
  const executionPrice = getExecutionPrice(order)
  const limitPrice = getLimitPrice(order)
  const surplusPrice = getSurplusPrice(order)
  const expires = new Date(validUntil * 1000)
  const now = new Date()

  const orderKindLabel = capitalize(kind)
  const isSellOrder = kind === 'sell'

  return (
    <DataTable
      header={`${orderKindLabel} order`}
      rows={[
        <div key="amount">
          <SwapTokens
            first={{
              value: formatVisualAmount(sellAmount, sellToken.decimals),
              label: 'Sell',
              logoUri: sellToken.logoUri as string,
              tokenSymbol: sellToken.symbol,
            }}
            second={{
              value: formatVisualAmount(buyAmount, buyToken.decimals),
              label: 'Buy',
              logoUri: buyToken.logoUri as string,
              tokenSymbol: buyToken.symbol,
            }}
          />
        </div>,

        status === 'fulfilled' ? (
          <DataRow key="Execution price" title="Execution price">
            1 {buyToken.symbol} = {formatAmount(executionPrice)} {sellToken.symbol}
          </DataRow>
        ) : (
          <DataRow key="Limit price" title="Limit price">
            1 {buyToken.symbol} = {formatAmount(limitPrice)} {sellToken.symbol}
          </DataRow>
        ),
        status === 'fulfilled' ? (
          <DataRow key="Surplus" title="Surplus">
            {formatAmount(surplusPrice)} {buyToken.symbol}
          </DataRow>
        ) : (
          <></>
        ),
        status !== 'fulfilled' ? (
          compareAsc(now, expires) !== 1 ? (
            <DataRow key="Expiry" title="Expiry">
              <Typography>
                <Typography fontWeight={700} component="span">
                  {formatTimeInWords(validUntil * 1000)}
                </Typography>{' '}
                ({formatDateTime(validUntil * 1000)})
              </Typography>
            </DataRow>
          ) : (
            <DataRow key="Expiry" title="Expiry">
              {formatDateTime(validUntil * 1000)}
            </DataRow>
          )
        ) : (
          <></>
        ),
        <DataRow key="Order ID" title="Order ID">
          <OrderId orderId={uid} href={explorerUrl} />
        </DataRow>,
        <DataRow key="Status" title="Status">
          <StatusLabel status={status} />
        </DataRow>,
      ]}
    />
  )
}

export const SwapOrderConfirmationView = ({ order }: SwapOrderProps): ReactElement | null => {
  if (!order) return null

  return <Order order={order} />
}

export default SwapOrderConfirmationView
