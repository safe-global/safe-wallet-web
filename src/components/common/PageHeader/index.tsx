import useAddressBook from '@/hooks/useAddressBook'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Box, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: ReactElement
}): ReactElement => {
  const safeAddress = useSafeAddress()
  const addressBook = useAddressBook()

  const isNamedSafe = !!addressBook[safeAddress]

  return (
    <Box
      className={css.container}
      sx={{
        // Doesn't work in module
        position: 'sticky',
        top: -96,
        height: isNamedSafe ? '219px' : '199px',
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
