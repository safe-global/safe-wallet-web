import type { ReactNode } from 'react'
import { Card, CardContent } from '@mui/material'
import css from '../styles.module.css'

const sx = { my: 2, border: 0 }

const TxCard = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <Card sx={sx} className={className}>
      <CardContent className={css.cardContent}>{children}</CardContent>
    </Card>
  )
}

export default TxCard
