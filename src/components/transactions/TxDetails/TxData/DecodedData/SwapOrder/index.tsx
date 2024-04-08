import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { Operation, SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'
import type { TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import { useState, useEffect } from 'react'
import type { Dispatch, ReactElement, SetStateAction } from 'react'
import type { AccordionProps } from '@mui/material/Accordion/Accordion'
import SingleTxDecoded from '@/components/transactions/TxDetails/TxData/DecodedData/SingleTxDecoded'
import { Button, Divider, Stack } from '@mui/material'
import css from './styles.module.css'
import classnames from 'classnames'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import Image from 'next/image'

type SwapOrderProps = {
  txData?: TransactionData
  txInfo?: SwapOrder
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

const SellOrder = ({ order }: { order: SwapOrder }) => {
  const { buyToken, sellToken, orderUid, expiresTimestamp, status, surplusLabel } = order
  return (
    <div className="sell-order">
      <h2>Sell order</h2>
      <div className="sell-details">
        <div className="detail">
          <span className="label">Amount:</span>
          <div className="value">
            <div>
              Sell{' '}
              <span className="value">
              <Image src={sellToken.logo} alt={sellToken.symbol}  width={32} height={32}/> {sellToken.amount} {sellToken.symbol}
            </span>
            </div>
            <div>
              For at least{' '}
              <span className="value">
             <Image src={buyToken.logo} alt={buyToken.symbol} width={32} height={32}/>{buyToken.amount} {buyToken.symbol}
            </span>

            </div>
                      </div>
        </div>
        <div className="detail">
          <span className="label">Expiry:</span>
          <span className="value">{expiresTimestamp}</span>
        </div>
        <div className="detail">
          <span className="label">Order ID:</span>
          <span className="value">{orderUid}</span>
        </div>
        <div className={`status status-${status.toLowerCase()}`}>
          <span className="status-label">{status}</span>
        </div>
      </div>
    </div>
  )
}

export const SwapOrder = ({ txData, txInfo }: SwapOrderProps): ReactElement | null => {
  const [openMap, setOpenMap] = useState<Record<number, boolean>>()
  const isOpenMapUndefined = openMap == null

  // const { amount, limitPrice, expiry, orderId, status } = txInfo
  // console.log('multisend tx', txData)
  // multiSend method receives one parameter `transactions`
  const multiSendTransactions = txData?.dataDecoded?.parameters?.[0].valueDecoded

  console.log('swap order', txInfo)
  // useEffect(() => {
  //   // Initialise whether each transaction should be expanded or not
  //   if (isOpenMapUndefined && multiSendTransactions) {
  //     setOpenMap(
  //       multiSendTransactions.map(({ operation }) => {
  //         return showDelegateCallWarning ? operation === Operation.DELEGATE : false
  //       }),
  //     )
  //   }
  // }, [multiSendTransactions, isOpenMapUndefined, showDelegateCallWarning])

  if (!txData) return null

  // ? when can a multiSend call take no parameters?
  if (!txData.dataDecoded?.parameters) {
    if (txData.hexData) {
      return <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
    }
    return null
  }

  // if (multiSendTransactions) {
  //   return <Multisend txData={txData} />
  // }

  return (
    <>
      <SellOrder order={txInfo} />
      {multiSendTransactions && <Multisend txData={txData} />}
    </>
  )
  return (
    <>
      <SwapOrderHeader setOpen={setOpenMap} amount={multiSendTransactions.length} />

      <div className={compact ? css.compact : ''}>
        {multiSendTransactions.map(({ dataDecoded, data, value, to, operation }, index) => {
          const onChange: AccordionProps['onChange'] = (_, expanded) => {
            setOpenMap((prev) => ({
              ...prev,
              [index]: expanded,
            }))
          }

          return (
            <SingleTxDecoded
              key={`${data ?? to}-${index}`}
              tx={{
                dataDecoded,
                data,
                value,
                to,
                operation,
              }}
              txData={txData}
              showDelegateCallWarning={showDelegateCallWarning}
              actionTitle={`${index + 1}`}
              variant={compact ? 'outlined' : 'elevation'}
              expanded={openMap?.[index] ?? false}
              onChange={onChange}
            />
          )
        })}
      </div>
    </>
  )
}

export default SwapOrder
