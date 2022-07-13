import React from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'

type Props = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  first: string
  second?: string
}
export const Breadcrumbs = ({ icon, first, second }: Props) => {
  const Icon = icon

  return (
    <div className={css.container}>
      <Icon className={css.icon} />
      <Typography className={css.text}>{first}</Typography>
      {second && <Typography className={css.secondaryText}>{second}</Typography>}
    </div>
  )
}
