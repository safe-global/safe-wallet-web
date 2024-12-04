import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import css from '../styles.module.css'

const sx = { my: 2, border: 0 }

const TxCard = ({ children }: { children: ReactNode }) => {
  return (
    <Card sx={sx}>
      <CardContent className={css.cardContent}>{children}</CardContent>
    </Card>
  )
}

export default TxCard
