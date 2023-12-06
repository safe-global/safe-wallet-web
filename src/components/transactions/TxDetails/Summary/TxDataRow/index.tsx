import type { ReactElement, ReactNode } from 'react'
import type { AddressEx } from '@safe-global/safe-gateway-typescript-sdk'
import CopyButton from '@/components/common/CopyButton'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { Typography } from '@mui/material'
import { hexDataLength } from 'ethers/lib/utils'
import css from './styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'

type TxDataRowProps = {
  datatestid?: String
  title: ReactNode
  children?: ReactNode
}

export const TxDataRow = ({ datatestid, title, children }: TxDataRowProps): ReactElement | null => {
  if (children == undefined) return null
  return (
    <div data-testid={datatestid} className={css.gridRow}>
      <div data-testid="tx-row-title" className={css.title}>
        {title}
      </div>

      {typeof children === 'string' ? (
        <Typography component="div" data-testid="tx-data-row">
          {children}
        </Typography>
      ) : (
        children
      )}
    </div>
  )
}

export const generateDataRowValue = (
  value?: string,
  type?: 'hash' | 'rawData' | 'address' | 'bytes',
  hasExplorer?: boolean,
  addressInfo?: AddressEx,
): ReactElement | null => {
  if (value == undefined) return null

  switch (type) {
    case 'hash':
    case 'address':
      const customAvatar = addressInfo?.logoUri

      return (
        <EthHashInfo
          address={value}
          name={addressInfo?.name}
          customAvatar={customAvatar}
          showAvatar={!!customAvatar}
          hasExplorer={hasExplorer}
          showCopyButton
        />
      )
    case 'rawData':
      return (
        <div data-testid="tx-data-row" className={css.rawData}>
          <div>{value ? hexDataLength(value) : 0} bytes</div>
          <CopyButton text={value} />
        </div>
      )
    case 'bytes':
      return <HexEncodedData limit={60} hexData={value} />
    default:
      return <Typography sx={{ wordBreak: 'break-all' }}>{value}</Typography>
  }
}
