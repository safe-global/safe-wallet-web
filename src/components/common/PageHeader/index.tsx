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
        height: `${199 + nameHeight}.5px`,
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
