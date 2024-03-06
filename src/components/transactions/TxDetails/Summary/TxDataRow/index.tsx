import CopyButton from '@/components/common/CopyButton'
import EthHashInfo from '@/components/common/EthHashInfo'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { Typography } from '@mui/material'
import type { AddressEx } from '@safe-global/safe-gateway-typescript-sdk'
import { dataLength } from 'ethers'
import type { ReactElement, ReactNode } from 'react'
import css from './styles.module.css'

type TxDataRowProps = {
  datatestid?: String
  title: ReactNode
  children?: ReactNode
}

export const TxDataRow = ({ datatestid, title, children }: TxDataRowProps): ReactElement | null => {
  if (children == undefined) return null
  return (
    <div data-sid="10812" data-testid={datatestid} className={css.gridRow}>
      <div data-sid="86008" data-testid="tx-row-title" className={css.title}>
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
        <div data-sid="88508" data-testid="tx-data-row" className={css.rawData}>
          <div>{value ? dataLength(value) : 0} bytes</div>
          <CopyButton text={value} />
        </div>
      )
    case 'bytes':
      return <HexEncodedData limit={60} hexData={value} />
    default:
      return <Typography sx={{ wordBreak: 'break-all' }}>{value}</Typography>
  }
}
