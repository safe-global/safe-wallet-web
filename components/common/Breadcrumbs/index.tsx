import React from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'

type Props = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  parent: string
  child: string
}
export const Breadcrumbs = ({ icon, parent, child }: Props) => {
  const Icon = icon

  return (
    <div className={css.container}>
      <Icon className={css.icon} />
      <Typography className={css.text}>{parent}</Typography>
      <Typography className={css.secondaryText}>/ {child}</Typography>
    </div>
  )
}
