import { CardHeader, Avatar, Typography } from '@mui/material'
import type { CardHeaderProps } from '@mui/material'

import css from './styles.module.css'

const CreateSafeCardHeader = ({ step, ...props }: CardHeaderProps & { step: number }) => {
  return (
    <CardHeader
      titleTypographyProps={{ variant: 'h4' }}
      subheaderTypographyProps={{ variant: 'body2' }}
      avatar={
        <Avatar className={css.avatar}>
          <Typography variant="body2">{step}</Typography>
        </Avatar>
      }
      className={css.header}
      {...props}
    />
  )
}

export default CreateSafeCardHeader
