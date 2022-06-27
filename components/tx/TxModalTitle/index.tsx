import { Typography } from '@mui/material'
import { ReactElement, ReactNode } from 'react'

const TxModalTitle = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <Typography
      variant="h4"
      sx={{
        borderBottom: ({ palette }) => `2px solid ${palette.divider}`,
        marginX: -3,
        paddingX: 3,
        paddingBottom: 2,
      }}
    >
      {children}
    </Typography>
  )
}

export default TxModalTitle
