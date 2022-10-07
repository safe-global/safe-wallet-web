import useAddressBook from '@/hooks/useAddressBook'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Box, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

const SIDEBAR_HEADER_HEIGHT = 158

const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string | ReactElement
  action?: ReactElement
}): ReactElement => {
  const safeAddress = useSafeAddress()
  const addressBook = useAddressBook()
  const isNamedSafe = !!addressBook[safeAddress]
  const nameHeight = isNamedSafe ? 20 : 0

  return (
    <Box
      className={css.container}
      sx={{
        height: `${SIDEBAR_HEADER_HEIGHT + nameHeight}px`,
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
