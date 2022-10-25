import { Card, CardHeader, Avatar, Typography, CardContent, CardActions, LinearProgress } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

const StepCard = ({
  title,
  subheader,
  content,
  actions,
}: {
  title: string
  subheader: string
  content: ReactElement
  actions: ReactElement
}): ReactElement => {
  // TODO: `step` and `LinearProgress` will be set via stepper hook
  const step = 1

  return (
    <Card className={css.card}>
      <LinearProgress />
      <CardHeader
        title={title}
        subheader={subheader}
        titleTypographyProps={{ variant: 'h4' }}
        subheaderTypographyProps={{ variant: 'body2' }}
        avatar={
          <Avatar className={css.step}>
            <Typography variant="body2">{step}</Typography>
          </Avatar>
        }
        className={css.header}
      />
      <CardContent className={css.content}>{content}</CardContent>
      <CardActions className={css.actions}>{actions}</CardActions>
    </Card>
  )
}

export default StepCard
