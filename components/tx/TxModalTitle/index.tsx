import { DialogTitle } from '@mui/material'
import { ReactElement, ReactNode } from 'react'

const TxModalTitle = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <DialogTitle
      sx={{
        marginY: -1,
        marginX: -3,
        paddingY: 0,
        paddingX: 3,
        paddingBottom: 2,
      }}
    >
      {children}
    </DialogTitle>
  )
}

export default TxModalTitle
