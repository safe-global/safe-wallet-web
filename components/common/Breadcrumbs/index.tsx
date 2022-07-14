import React from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'

type Props = {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  first: string
  second?: string
}
export const Breadcrumbs = ({ Icon, first, second }: Props) => {
  return (
    <div className={css.container}>
      <Icon className={css.icon} />
      <Typography className={css.text}>{first}</Typography>
      {second && <Typography className={css.secondaryText}>/ {second}</Typography>}
    </div>
  )
}
