import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Paper, Typography } from '@mui/material'
import AccountItem from './AccountItem'
import { type SafeItems } from './useAllSafes'
import css from './styles.module.css'

type PaginatedSafeListProps = {
  safes: SafeItems
  noSafesMessage?: ReactNode
  onLinkClick?: () => void
}

const DEFAULT_SHOWN = 5
const MAX_DEFAULT_SHOWN = 7
const PAGE_SIZE = 5

const PaginatedSafeList = ({ safes, noSafesMessage, onLinkClick }: PaginatedSafeListProps) => {
  const [maxShownSafes, setMaxShownSafes] = useState<number>(DEFAULT_SHOWN)

  const shownSafes = useMemo(() => {
    if (safes.length <= MAX_DEFAULT_SHOWN) {
      return safes
    }
    return safes.slice(0, maxShownSafes)
  }, [safes, maxShownSafes])

  const onShowMoreSafes = () => setMaxShownSafes((prev) => prev + PAGE_SIZE)

  return (
    <Paper className={css.safeList}>
      {shownSafes.length ? (
        shownSafes.map((item) => (
          <AccountItem
            onLinkClick={onLinkClick}
            isReadonly={item.isReadonly}
            {...item}
            key={item.chainId + item.address}
          />
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={3} mx="auto" width={250}>
          {noSafesMessage}
        </Typography>
      )}
    </Paper>
  )
}

export default PaginatedSafeList
