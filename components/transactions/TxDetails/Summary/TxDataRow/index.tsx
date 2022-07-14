import TokenExplorerLink from '@/components/common/TokenExplorerLink'
import CopyAddressButton from '@/components/common/CopyAddressButton'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { shortenAddress } from '@/utils/formatters'
import { Typography } from '@mui/material'
import { hexDataLength } from 'ethers/lib/utils'
import { ReactElement, ReactNode } from 'react'
import css from './styles.module.css'

type TxDataRowProps = {
  title: string
  children?: ReactNode
}

export const TxDataRow = ({ title, children }: TxDataRowProps): ReactElement | null => {
  if (children == undefined) return null
  return (
    <div className={css.gridRow}>
      <Typography
        sx={({ palette }) => ({
          color: palette.secondary.light,
        })}
      >
        {title}
      </Typography>
      {children}
    </div>
  )
}

export const generateDataRowValue = (
  value?: string | null,
  type?: 'hash' | 'rawData' | 'address' | 'bytes',
  hasExplorer?: boolean,
): ReactElement | null => {
  if (value == undefined) return null
  switch (type) {
    case 'address':
      return (
        <div className={css.inline}>
          {/* TODO: missing the chain prefix */}
          <Typography>{shortenAddress(value, 8)}</Typography>
          <CopyAddressButton address={value} />
          {hasExplorer && <TokenExplorerLink address={value} />}
        </div>
      )
    case 'hash':
      return (
        <div className={css.inline}>
          <div>{shortenAddress(value, 8)}</div>
          <CopyAddressButton address={value} />
          {hasExplorer && <TokenExplorerLink address={value} />}
        </div>
      )
    case 'rawData':
      return (
        <div className={css.rawData}>
          <div>{value ? hexDataLength(value) : 0} bytes</div>
          <CopyAddressButton address={value} />
        </div>
      )
    case 'bytes':
      return <HexEncodedData limit={60} hexData={value} />
    default:
      return <Typography sx={{ wordBreak: 'break-all' }}>{value}</Typography>
  }
}
