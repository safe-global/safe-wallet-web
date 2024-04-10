import { DataRow } from '@/components/common/Table/DataRow'
import { DataTable } from '@/components/common/Table/DataTable'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { type SwapOrder as SwapOrderType, type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import type { Dispatch, ReactElement, SetStateAction } from 'react'
import { Button, Divider, Stack } from '@mui/material'
import css from './styles.module.css'
import classnames from 'classnames'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import Image from 'next/image'

type SwapOrderProps = {
  txData?: TransactionData
  txInfo?: SwapOrderType
}

export const SwapOrderHeader = ({
  setOpen,
  amount,
  compact = false,
  title = 'All actions',
}: {
  setOpen: Dispatch<SetStateAction<Record<number, boolean> | undefined>>
  amount: number
  compact?: boolean
  title?: string
}) => {
  const onClickAll = (expanded: boolean) => () => {
    setOpen(Array(amount).fill(expanded))
  }

  return (
    <div data-testid="all-actions" className={classnames(css.actionsHeader, { [css.compactHeader]: compact })}>
      {title}
      <Stack direction="row" divider={<Divider className={css.divider} />}>
        <Button data-testid="expande-all-btn" onClick={onClickAll(true)} variant="text">
          Expand all
        </Button>
        <Button data-testid="collapse-all-btn" onClick={onClickAll(false)} variant="text">
          Collapse all
        </Button>
      </Stack>
    </div>
  )
}

const SellOrder = ({ order }: { order: SwapOrderType }) => {
  const { buyToken, sellToken, orderUid, expiresTimestamp, status, executionPriceLabel, surplusLabel } = order
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
        <DataRow key="Surplus" title="Surplus">
          {surplusLabel}
        </DataRow>,
        <DataRow key="Expiry" title="Expiry">
          {expiresTimestamp}
        </DataRow>,
        <DataRow key="Order ID" title="Order ID">
          {orderUid}
        </DataRow>,
        <DataRow key="Status" title="Status">
          {status}
        </DataRow>,
      ]}
    />
  )
}

export const SwapOrder = ({ txData, txInfo }: SwapOrderProps): ReactElement | null => {
  const multiSendTransactions = txData?.dataDecoded?.parameters?.[0].valueDecoded

  if (!txData) return null

  // ? when can a multiSend call take no parameters?
  if (!txData.dataDecoded?.parameters) {
    if (txData.hexData) {
      return <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
    }
    return null
  }

  return (
    <>
      {txInfo && <SellOrder order={txInfo} />}
      {multiSendTransactions && <Multisend txData={txData} />}
    </>
  )
}

export default SwapOrder
