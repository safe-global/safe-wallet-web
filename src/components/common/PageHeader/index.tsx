import useAddressBook from '@/hooks/useAddressBook'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Box, Typography, useMediaQuery } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

const SIDEBAR_HEADER_HEIGHT = 199
const RETINA_DISPLAY_MEDIA_QUERY = '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'

const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string | ReactElement
  action?: ReactElement
}): ReactElement => {
  const isRetinaDisplay = useMediaQuery(RETINA_DISPLAY_MEDIA_QUERY)

  const safeAddress = useSafeAddress()
  const addressBook = useAddressBook()
  const isNamedSafe = !!addressBook[safeAddress]
  const nameHeight = isNamedSafe ? 20 : 0

  return (
    <Box
      className={css.container}
      sx={{
        height: isRetinaDisplay
          ? `${SIDEBAR_HEADER_HEIGHT + nameHeight}.5px`
          : `${SIDEBAR_HEADER_HEIGHT + nameHeight}px`,
        top: `-${76 + nameHeight}px`,
      }}
    >
      <div>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={400} color="primary.light">
          {subtitle}
        </Typography>
      </div>
      {action}
    </Box>
  )
}

export default PageHeader
