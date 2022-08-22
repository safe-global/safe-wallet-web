import React from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'
import Link from 'next/link'

type Props = {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  first: string
  second?: string
  firstLink?: string
}
export const Breadcrumbs = ({ Icon, first, second, firstLink }: Props) => {
  return (
    <div className={css.container}>
      <Icon className={css.icon} />

      <Typography className={css.text}>
        {firstLink ? (
          <Link href={firstLink} passHref>
            <a>{first}</a>
          </Link>
        ) : (
          first
        )}
      </Typography>

      {second && <Typography className={css.secondaryText}>/ {second}</Typography>}
    </div>
  )
}
