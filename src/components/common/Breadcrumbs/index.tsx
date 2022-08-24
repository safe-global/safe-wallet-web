import React from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'
import Link from 'next/link'
import { NextRouter, useRouter } from 'next/router'

const getParentPath = ({ pathname, query }: NextRouter) => {
  const parent = pathname.split('/')?.slice(0, -1).join('/')
  return {
    pathname: parent,
    query,
  }
}

type Props = {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  first: string
  second?: string
}
export const Breadcrumbs = ({ Icon, first, second }: Props) => {
  const router = useRouter()

  const link = second ? getParentPath(router) : undefined

  return (
    <div className={css.container}>
      <Icon className={css.icon} />

      <Typography className={css.text}>
        {link ? (
          <Link href={link} passHref>
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
