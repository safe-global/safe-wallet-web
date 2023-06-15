import type { ReactNode } from 'react'
import { Card, CardContent } from '@mui/material'

const sx = { my: 1 }

const TxCard = ({ children }: { children: ReactNode }) => {
  return (
    <Card sx={sx}>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default TxCard
