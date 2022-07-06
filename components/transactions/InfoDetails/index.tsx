import { Typography } from '@mui/material'
import { ReactElement, ReactNode } from 'react'
import css from './styles.module.css'

type InfoDetailsProps = {
  children?: ReactNode
  title: string | ReactElement
}

export const InfoDetails = ({ children, title }: InfoDetailsProps): ReactElement => (
  <div className={css.container}>
    <Typography variant="body1" fontWeight="bold">
      {title}
    </Typography>
    {children}
  </div>
)
