import type { ReactNode } from 'react'
import { Card, CardContent } from '@mui/material'
import css from '../styles.module.css'

const sx = { my: 1 }

const TxCard = ({ children }: { children: ReactNode }) => {
  return (
    <Card sx={sx}>
      <CardContent className={css.cardContent}>{children}</CardContent>
    </Card>
  )
}

export default TxCard
