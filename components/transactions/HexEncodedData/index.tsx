import { shortenText } from '@/utils/formatters'
import { Box, Button, Typography } from '@mui/material'
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
        <Typography>
          <b>{title}:</b>
        </Typography>
      )}
      {showExpandBtn ? (
        <>
          {showTxData ? hexData : shortenText(hexData, 25)}{' '}
          <Button disableRipple onClick={toggleExpanded} variant="text" size="small" sx={{ p: 0 }}>
            <Typography
              sx={({ palette }) => ({
                color: palette.primary.main,
                textDecoration: 'underline',
              })}
            >
              Show {showTxData ? 'Less' : 'More'}
            </Typography>
          </Button>
        </>
      ) : (
        <Typography>{hexData}</Typography>
      )}
    </Box>
  )
}
