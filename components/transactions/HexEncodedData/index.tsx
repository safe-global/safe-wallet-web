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
        <Typography variant="body1">
          <b>{title}:</b>
        </Typography>
      )}
      {showExpandBtn ? (
        <>
          {showTxData ? hexData : shortenText(hexData, 25)}{' '}
          <Button disableRipple onClick={toggleExpanded}>
            <Typography
              sx={({ palette }) => ({
                // @ts-expect-error type '400' can't be used to index type 'PaletteColor'
                color: palette.primary[400],
                textDecoration: 'underline',
              })}
              variant="body1"
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
