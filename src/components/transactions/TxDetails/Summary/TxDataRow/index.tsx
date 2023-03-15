import CopyButton from '@/components/common/CopyButton'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { Typography } from '@mui/material'
import { hexDataLength } from 'ethers/lib/utils'
import type { ReactElement, ReactNode } from 'react'
import css from './styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'

type TxDataRowProps = {
  title: string
  children?: ReactNode
}

export const TxDataRow = ({ title, children }: TxDataRowProps): ReactElement | null => {
  if (children == undefined) return null
  return (
    <div className={css.gridRow}>
      <div className={css.title}>{title}</div>

      {typeof children === 'string' ? <Typography component="div">{children}</Typography> : children}
    </div>
  )
}

export const generateDataRowValue = (
  value?: string,
  type?: 'hash' | 'rawData' | 'address' | 'bytes',
  hasExplorer?: boolean,
): ReactElement | null => {
  if (value == undefined) return null
  switch (type) {
    case 'hash':
    case 'address':
      return <EthHashInfo address={value} hasExplorer={hasExplorer} showAvatar={false} showCopyButton />
    case 'rawData':
      return (
        <div className={css.rawData}>
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
