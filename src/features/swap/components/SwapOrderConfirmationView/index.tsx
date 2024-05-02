import OrderId from '@/features/swap/components/OrderId'
import { formatDateTime, formatTimeInWords } from '@/utils/date'
import type { ReactElement } from 'react'
import { DataRow } from '@/components/common/Table/DataRow'
import { DataTable } from '@/components/common/Table/DataTable'
import { compareAsc } from 'date-fns'
import { Alert, Typography } from '@mui/material'
import { formatAmount } from '@/utils/formatNumber'
import { formatVisualAmount } from '@/utils/formatters'
import { getExecutionPrice, getLimitPrice, getSlippageInPercent, getSurplusPrice } from '@/features/swap/helpers/utils'
import type { CowSwapConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import SwapTokens from '@/features/swap/components/SwapTokens'
import AlertIcon from '@/public/images/common/alert.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import CowLogo from '@/public/images/swaps/cow-logo.png'
import css from './styles.module.css'

type SwapOrderProps = {
  order: CowSwapConfirmationView
  settlementContract: string
}

export const SwapOrderConfirmationView = ({ order, settlementContract }: SwapOrderProps): ReactElement | null => {
  if (!order) return null

  const {
    uid,
    owner,
    kind,
    validUntil,
    status,
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    explorerUrl,
    receiver,
    orderClass,
  } = order

  const executionPrice = getExecutionPrice(order)
  const limitPrice = getLimitPrice(order)
  const surplusPrice = getSurplusPrice(order)
  const expires = new Date(validUntil * 1000)
  const now = new Date()

  const slippage = getSlippageInPercent(order)
  const isSellOrder = kind === 'sell'

  return (
    <div className={css.tableWrapper}>
      <DataTable
        header="Order Details"
        rows={[
          <div key="amount">
            <SwapTokens
              first={{
                value: formatVisualAmount(sellAmount, sellToken.decimals),
                label: isSellOrder ? 'Sell' : 'For at most',
                logoUri: sellToken.logoUri as string,
                tokenSymbol: sellToken.symbol,
              }}
              second={{
                value: formatVisualAmount(buyAmount, buyToken.decimals),
                label: isSellOrder ? 'For at least' : 'Buy exactly',
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
          orderClass !== 'limit' ? (
            <DataRow key="Slippage" title="Slippage">
              {slippage}%
            </DataRow>
          ) : (
            <></>
          ),
          <DataRow key="Order ID" title="Order ID">
            <OrderId orderId={uid} href={explorerUrl} />
          </DataRow>,
          <DataRow key="Interact with" title="Interact with">
            <EthHashInfo
              address={settlementContract}
              name="Cow Protocol"
              customAvatar={CowLogo.src}
              avatarSize={24}
              shortAddress={false}
              hasExplorer
              onlyName
            />
          </DataRow>,
          receiver && owner !== receiver ? (
            <>
              <DataRow key="recipient-address" title="Recipient">
                <EthHashInfo address={receiver} hasExplorer={true} avatarSize={24} />
              </DataRow>
              <div key="recipient">
                <Alert severity="warning" icon={AlertIcon}>
                  <Typography variant="body2">
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>
                      Order recipient address differs from order owner.
                    </Typography>{' '}
                    Double check the address to prevent fund loss.
                  </Typography>
                </Alert>
              </div>
            </>
          ) : (
            <></>
          ),
        ]}
      />
    </div>
  )
}

export default SwapOrderConfirmationView
