import { Typography } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import css from './styles.module.css'

type InfoDetailsProps = {
  children?: ReactNode
  title: string | ReactElement
}

export const InfoDetails = ({ children, title }: InfoDetailsProps): ReactElement => (
  <div className={css.container}>
    <Typography>
      <b>{title}</b>
    </Typography>
    {children}
  </div>
)
