import TokenIcon from '@/components/common/TokenIcon'
import OrderId from '@/features/swap/components/OrderId'
import StatusLabel from '@/features/swap/components/StatusLabel'
import SwapProgress from '@/features/swap/components/SwapProgress'
import { capitalize } from '@/hooks/useMnemonicName'
import { formatDateTime, formatTimeInWords } from '@/utils/date'
import Stack from '@mui/material/Stack'
import type { ReactElement } from 'react'
import { type SwapOrder as SwapOrderType, type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import { DataRow } from '@/components/common/Table/DataRow'
import { DataTable } from '@/components/common/Table/DataTable'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { compareAsc } from 'date-fns'
import css from './styles.module.css'
import { Typography } from '@mui/material'
import { formatAmount } from '@/utils/formatNumber'
import { formatVisualAmount } from '@/utils/formatters'
import {
  getExecutionPrice,
  getLimitPrice,
  getOrderClass,
  getSurplusPrice,
  isOrderPartiallyFilled,
} from '@/features/swap/helpers/utils'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'

type SwapOrderProps = {
  txData?: TransactionData
  txInfo?: SwapOrderType
}

export const SellOrder = ({ order }: { order: SwapOrderType }) => {
  const { safeAddress } = useSafeInfo()
  const { uid, kind, validUntil, status, sellToken, buyToken, sellAmount, buyAmount, explorerUrl, receiver } = order

  const executionPrice = getExecutionPrice(order)
  const limitPrice = getLimitPrice(order)
  const surplusPrice = getSurplusPrice(order)
  const expires = new Date(validUntil * 1000)
  const now = new Date()
  const orderClass = getOrderClass(order)

  const orderKindLabel = capitalize(kind)
  const isSellOrder = kind === 'sell'

  const isPartiallyFilled = isOrderPartiallyFilled(order)

  return (
    <DataTable
      header={`${orderKindLabel} order`}
      rows={[
        <DataRow key="Amount" title="Amount">
          <Stack flexDirection={isSellOrder ? 'column' : 'column-reverse'}>
            <div>
              <span className={css.value}>
                {isSellOrder ? 'Sell' : 'For at most'}{' '}
                {sellToken.logoUri && <TokenIcon logoUri={sellToken.logoUri} size={24} />}{' '}
                {formatVisualAmount(sellAmount, sellToken.decimals)} {sellToken.symbol}
              </span>
            </div>
            <div>
              <span className={css.value}>
                {isSellOrder ? 'for at least' : 'Buy'}{' '}
                {buyToken.logoUri && <TokenIcon logoUri={buyToken.logoUri} size={24} />}
                {formatVisualAmount(buyAmount, buyToken.decimals)} {buyToken.symbol}
              </span>
            </div>
          </Stack>
        </DataRow>,
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
            {formatAmount(surplusPrice)} {isSellOrder ? buyToken.symbol : sellToken.symbol}
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
        orderClass === 'limit' ? (
          <DataRow title="Filled" key="Filled">
            <SwapProgress order={order} />
          </DataRow>
        ) : (
          <></>
        ),
        <DataRow key="Order ID" title="Order ID">
          <OrderId orderId={uid} href={explorerUrl} />
        </DataRow>,
        <DataRow key="Status" title="Status">
          <StatusLabel status={isPartiallyFilled ? 'partiallyFilled' : status} />
        </DataRow>,
        receiver && receiver !== safeAddress ? (
          <DataRow key="Recipient" title="Recipient">
            <EthHashInfo address={receiver} showAvatar={false} />
          </DataRow>
        ) : (
          <></>
        ),
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
