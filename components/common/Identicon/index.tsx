import { ReactElement, useMemo, CSSProperties } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import { Box } from '@mui/material'

import css from './styles.module.css'

interface ThresholdProps {
  threshold: number | string
  owners: number | string
}
const Threshold = ({ threshold, owners }: ThresholdProps): ReactElement => (
  <Box
    className={css.threshold}
    sx={({ palette }) => ({
      background: palette.primaryGreen[200],
      // @ts-expect-error type '400' can't be used to index type 'PaletteColor'
      color: palette.primary[400],
    })}
  >
    {threshold}/{owners}
  </Box>
)

interface IdenticonProps {
  address: string
  threshold?: ThresholdProps['threshold']
  owners?: ThresholdProps['owners']
}

const Identicon = ({ address, threshold, owners }: IdenticonProps): ReactElement => {
  const style = useMemo<CSSProperties>(() => {
    let blockie = ''
    try {
      blockie = makeBlockie(address)
    } catch (e) {}
    return { backgroundImage: `url(${blockie})` }
  }, [address])

  return (
    <div style={{ position: 'relative' }}>
      {threshold && owners && <Threshold threshold={threshold} owners={owners} />}
      <div className={css.icon} style={style} />
    </div>
  )
}

export default Identicon
