import { Card, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

const LOGO_DIMENSIONS = '22px'

const OverviewWidget = ({ rows }: { rows?: { title: string; component: ReactElement }[] }): ReactElement => {
  return (
    <Card className={css.card}>
      <div className={css.header}>
        <img src="/images/logo-no-text.svg" alt="Safe logo" width={LOGO_DIMENSIONS} />
        <Typography variant="h4">Your Safe preview</Typography>
      </div>
      {rows?.map((row) => (
        <div key={row.title} className={css.row}>
          <Typography variant="body2">{row.title}</Typography>
          {row.component}
        </div>
      ))}
    </Card>
  )
}

export default OverviewWidget
