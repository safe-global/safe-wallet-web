import { shortenText } from '@/utils/formatters'
import { Box, Link } from '@mui/material'
import type { ReactElement } from 'react'
import { useState } from 'react'
import css from './styles.module.css'
import CopyButton from '@/components/common/CopyButton'

interface Props {
  hexData: string
  title?: string
  limit?: number
}

const FIRST_BYTES = 10

export const HexEncodedData = ({ hexData, title, limit = 20 }: Props): ReactElement => {
  const [showTxData, setShowTxData] = useState(false)
  const showExpandBtn = hexData.length > limit

  const toggleExpanded = () => {
    setShowTxData((val) => !val)
  }

  const firstBytes = <b>{hexData.slice(0, FIRST_BYTES)}</b>
  const restBytes = hexData.slice(FIRST_BYTES)

  return (
    <Box data-testid="tx-hexData" className={css.encodedData}>
      {title && (
        <span>
          <b>{title}: </b>
        </span>
      )}

      <CopyButton text={hexData} />

      {firstBytes}
      {showExpandBtn ? (
        <>
          {showTxData ? restBytes : shortenText(restBytes, limit - FIRST_BYTES)}{' '}
          <Link component="button" onClick={toggleExpanded} type="button" sx={{ verticalAlign: 'text-top' }}>
            Show {showTxData ? 'less' : 'more'}
          </Link>
        </>
      ) : (
        <span>{restBytes}</span>
      )}
    </Box>
  )
}
