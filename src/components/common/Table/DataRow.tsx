import type { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'

type DataRowProps = {
  datatestid?: String
  title: ReactNode
  children?: ReactNode
}

export const DataRow = ({ datatestid, title, children }: DataRowProps): ReactElement | null => {
  if (children == undefined) return null
  return (
    <div data-testid={datatestid} className={css.gridRow}>
      <div data-testid="tx-row-title" className={css.title}>
        {title}
      </div>

      {typeof children === 'string' ? (
        <Typography component="div" data-testid="tx-data-row">
          {children}
        </Typography>
      ) : (
        children
      )}
    </div>
  )
}
