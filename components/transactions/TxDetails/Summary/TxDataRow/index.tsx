import { Box, Typography } from '@mui/material'
import { ReactElement, ReactNode } from 'react'
import css from './styles.module.css'

interface Props {
  title: string
  children?: ReactNode
}

export const TxDataRow = ({ title, children }: Props): ReactElement => {
  return (
    <div className={css.gridRow}>
      <Box
        sx={({ palette }) => ({
          color: palette.black[400],
        })}
      >
        <Typography variant="body1">{title}</Typography>
      </Box>
      {children}
    </div>
  )
}
