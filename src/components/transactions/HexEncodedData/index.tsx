import { shortenText } from '@/utils/formatters'
import { Box, Link } from '@mui/material'
import type { ReactElement } from 'react'
import { useState } from 'react'
import css from './styles.module.css'

interface Props {
  hexData: string
  title?: string
  limit?: number
}

export const HexEncodedData = ({ hexData, title, limit = 20 }: Props): ReactElement => {
  const [showTxData, setShowTxData] = useState(false)
  const showExpandBtn = hexData.length > limit

  const toggleExpanded = () => {
    setShowTxData((val) => !val)
  }

  return (
    <Box data-testid="tx-hexData" className={css.encodedData}>
      {title && (
        <span>
          <b>{title}: </b>
        </span>
      )}
      {showExpandBtn ? (
        <>
          {showTxData ? hexData : shortenText(hexData, 25)}{' '}
          <Link component="button" onClick={toggleExpanded} type="button" sx={{ verticalAlign: 'text-top' }}>
            Show {showTxData ? 'less' : 'more'}
          </Link>
        </>
      ) : (
        <span>{hexData}</span>
      )}
    </Box>
  )
}
