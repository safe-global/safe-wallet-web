import TokenIcon from '@/components/common/TokenIcon'
import OrderId from '@/features/swap/components/OrderId'
import StatusLabel from '@/features/swap/components/StatusLabel'
import SwapProgress from '@/features/swap/components/SwapProgress'
import { capitalize } from '@/hooks/useMnemonicName'
import { formatDateTime, formatTimeInWords } from '@/utils/date'
import Stack from '@mui/material/Stack'
import type { ReactElement } from 'react'
import type { TwapOrder as SwapTwapOrder } from '@safe-global/safe-gateway-typescript-sdk'
import {
  type SwapOrder as SwapOrderType,
  type Order,
  type TransactionData,
  TransactionInfoType,
} from '@safe-global/safe-gateway-typescript-sdk'
import { DataRow } from '@/components/common/Table/DataRow'
import { DataTable } from '@/components/common/Table/DataTable'
import { compareAsc } from 'date-fns'
import css from './styles.module.css'
import { Typography } from '@mui/material'
import { formatAmount } from '@/utils/formatNumber'
import { formatVisualAmount } from '@/utils/formatters'
import {
  getExecutionPrice,
  getLimitPrice,
  getOrderClass,
  getPartiallyFilledSurplus,
  getSurplusPrice,
  isOrderPartiallyFilled,
} from '@/features/swap/helpers/utils'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isSwapOrderTxInfo, isTwapOrderTxInfo } from '@/utils/transaction-guards'
import { EmptyRow } from '@/components/common/Table/EmptyRow'

type SwapOrderProps = {
  txData?: TransactionData
  txInfo?: Order
}

const AmountRow = ({ order }: { order: Order }) => {
  const { sellToken, buyToken, sellAmount, buyAmount, kind } = order
  const orderKindLabel = capitalize(kind)
  const isSellOrder = kind === 'sell'
  return (
    <DataRow key="Amount" title="Amount">
      <Stack flexDirection={isSellOrder ? 'column' : 'column-reverse'}>
        <div>
          <span className={css.value}>
            {isSellOrder ? 'Sell' : 'For at most'}{' '}
            {sellToken.logoUri && <TokenIcon logoUri={sellToken.logoUri} size={24} />}{' '}
            <Typography component="span" fontWeight="bold">
              {formatVisualAmount(sellAmount, sellToken.decimals)} {sellToken.symbol}
            </Typography>
          </span>
        </div>
        <div>
          <span className={css.value}>
            {isSellOrder ? 'for at least' : 'Buy'}{' '}
            {buyToken.logoUri && <TokenIcon logoUri={buyToken.logoUri} size={24} />}
            <Typography component="span" fontWeight="bold">
              {formatVisualAmount(buyAmount, buyToken.decimals)} {buyToken.symbol}
            </Typography>
          </span>
        </div>
      </Stack>
    </DataRow>
  )
}

const PriceRow = ({ order }: { order: Order }) => {
  const { status, sellToken, buyToken } = order
  const executionPrice = getExecutionPrice(order)
  const limitPrice = getLimitPrice(order)

  if (status === 'fulfilled') {
    return (
      <DataRow key="Execution price" title="Execution price">
        1 {buyToken.symbol} = {formatAmount(executionPrice)} {sellToken.symbol}
      </DataRow>
    )
  }

  return (
    <DataRow key="Limit price" title="Limit price">
      1 {buyToken.symbol} = {formatAmount(limitPrice)} {sellToken.symbol}
    </DataRow>
  )
}

const ExpiryRow = ({ order }: { order: Order }) => {
  const { validUntil, status } = order
  const now = new Date()
  const expires = new Date(validUntil * 1000)
  if (status! == 'fulfilled') {
    if (compareAsc(now, expires) !== 1) {
      return (
        <DataRow key="Expiry" title="Expiry">
          <Typography>
            <Typography fontWeight={700} component="span">
              {formatTimeInWords(validUntil * 1000)}
            </Typography>{' '}
            ({formatDateTime(validUntil * 1000)})
          </Typography>
        </DataRow>
      )
    } else {
      return (
        <DataRow key="Expiry" title="Expiry">
          {formatDateTime(validUntil * 1000)}
        </DataRow>
      )
    }
  }

  return null
}

const SurplusRow = ({ order }: { order: Order }) => {
  const { status, kind } = order
  const isPartiallyFilled = isOrderPartiallyFilled(order)
  const surplusPrice = isPartiallyFilled ? getPartiallyFilledSurplus(order) : getSurplusPrice(order)
  const { sellToken, buyToken } = order
  const isSellOrder = kind === 'sell'
  if (status === 'fulfilled' || isPartiallyFilled) {
    return (
      <DataRow key="Surplus" title="Surplus">
        {formatAmount(surplusPrice)} {isSellOrder ? buyToken.symbol : sellToken.symbol}
      </DataRow>
    )
  }

  return null
}

const FilledRow = ({ order }: { order: Order }) => {
  const orderClass = getOrderClass(order)
  if (['limit', 'twap'].includes(orderClass)) {
    return (
      <DataRow title="Filled" key="Filled">
        <SwapProgress order={order} />
      </DataRow>
    )
  }

  return null
}

const OrderUidRow = ({ order }: { order: Order }) => {
  if (order.type === TransactionInfoType.SWAP_ORDER) {
    const { uid, explorerUrl } = order
    return (
      <DataRow key="Order ID" title="Order ID">
        <OrderId orderId={uid} href={explorerUrl} />
      </DataRow>
    )
  }
  return null
}

const StatusRow = ({ order }: { order: Order }) => {
  const { status } = order
  const isPartiallyFilled = isOrderPartiallyFilled(order)
  return (
    <DataRow key="Status" title="Status">
      <StatusLabel status={isPartiallyFilled ? 'partiallyFilled' : status} />
    </DataRow>
  )
}

const RecipientRow = ({ order }: { order: Order }) => {
  const { safeAddress } = useSafeInfo()
  const { receiver } = order

  if (receiver && receiver !== safeAddress) {
    return (
      <DataRow key="Recipient" title="Recipient">
        <EthHashInfo address={receiver} showAvatar={false} />
      </DataRow>
    )
  }

  return null
}

export const SellOrder = ({ order }: { order: SwapOrderType }) => {
  const { kind } = order
  const orderKindLabel = capitalize(kind)

  return (
    <DataTable
      header={`${orderKindLabel} order`}
      rows={[
        <AmountRow order={order} key="amount-row" />,
        <PriceRow order={order} key="price-row" />,
        <SurplusRow order={order} key="surplus-row" />,
        <ExpiryRow order={order} key="expiry-row" />,
        <FilledRow order={order} key="filled-row" />,
        <OrderUidRow order={order} key="order-uid-row" />,
        <StatusRow order={order} key="status-row" />,
        <RecipientRow order={order} key="recipient-row" />,
      ]}
    />
  )
}

export const TwapOrder = ({ order }: { order: SwapTwapOrder }) => {
  const {
    kind,
    validUntil,
    status,
    sellToken,
    buyToken,
    numberOfParts,
    partSellAmount,
    minPartLimit,
    timeBetweenParts,
  } = order

  const isPartiallyFilled = isOrderPartiallyFilled(order)
  const expires = new Date(validUntil * 1000)
  const now = new Date()

  const orderKindLabel = capitalize(kind)

  return (
    <DataTable
      header={`${orderKindLabel} order`}
      rows={[
        <AmountRow order={order} key="amount-row" />,
        <PriceRow order={order} key="price-row" />,
        <SurplusRow order={order} key="surplus-row" />,
        <RecipientRow order={order} key="recipient-row" />,
        <EmptyRow key="spacer-0" />,
        <DataRow title="No of parts" key="n_of_parts">
          {numberOfParts}
        </DataRow>,
        <DataRow title="Sell amount" key="sell_amount_part">
          <Typography component="span" fontWeight="bold">
            {formatVisualAmount(partSellAmount, sellToken.decimals)} {sellToken.symbol}
          </Typography>
        </DataRow>,
        <DataRow title="Buy amount" key="buy_amount_part">
          <Typography component="span" fontWeight="bold">
            {formatVisualAmount(minPartLimit, buyToken.decimals)} {buyToken.symbol}
          </Typography>
        </DataRow>,
        <FilledRow order={order} key="filled-row" />,
        <DataRow title="Part duration" key="part_duration">
          {+timeBetweenParts / 60} minutes
        </DataRow>,
        <EmptyRow key="spacer-1" />,
        status !== 'fulfilled' && compareAsc(now, expires) !== 1 ? (
          <DataRow key="Expiry" title="Expiry">
            <Typography>
              <Typography fontWeight={700} component="span">
                {formatTimeInWords(validUntil * 1000)}
              </Typography>{' '}
              ({formatDateTime(validUntil * 1000)})
            </Typography>
          </DataRow>
        ) : (
          <DataRow key="Expired" title="Expired">
            {formatDateTime(validUntil * 1000)}
          </DataRow>
        ),
        <DataRow key="Status" title="Status">
          <StatusLabel status={isPartiallyFilled ? 'partiallyFilled' : status} />
        </DataRow>,
      ]}
    />
  )
}

export const SwapOrder = ({ txData, txInfo }: SwapOrderProps): ReactElement | null => {
  if (!txData || !txInfo) return null

  if (isTwapOrderTxInfo(txInfo)) {
    return <TwapOrder order={txInfo} />
  }

  if (isSwapOrderTxInfo(txInfo)) {
    return <SellOrder order={txInfo} />
  }
  return null
}

export default SwapOrder
