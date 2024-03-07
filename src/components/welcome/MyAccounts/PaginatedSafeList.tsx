import type { ReactNode } from 'react'
import { Typography } from '@mui/material'
import AccountItem from './AccountItem'
import { type SafeItems } from './useAllSafes'
import css from './styles.module.css'

type PaginatedSafeListProps = {
  safes: SafeItems
  noSafesMessage?: ReactNode
  onLinkClick?: () => void
}

const PaginatedSafeList = ({ safes, noSafesMessage, onLinkClick }: PaginatedSafeListProps) => {
  return (
    <div className={css.safeList}>
      {safes.length ? (
        safes.map((item) => <AccountItem onLinkClick={onLinkClick} {...item} key={item.chainId + item.address} />)
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={3} mx="auto" width={250}>
          {noSafesMessage}
        </Typography>
      )}
    </div>
  )
}

export default PaginatedSafeList
