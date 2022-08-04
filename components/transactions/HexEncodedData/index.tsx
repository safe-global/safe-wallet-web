import { shortenText } from '@/utils/formatters'
import { Box, Link } from '@mui/material'
import { ReactElement, useState } from 'react'
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
          <Link component="button" onClick={toggleExpanded}>
            Show {showTxData ? 'Less' : 'More'}
          </Link>
        </>
      ) : (
        <span>{hexData}</span>
      )}
    </Box>
  )
}
