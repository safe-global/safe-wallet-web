import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { Box, Button, Paper, Typography } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import AccountItem from './AccountItem'
import css from './styles.module.css'
import { type SafeItems } from './useAllSafes'

type PaginatedSafeListProps = {
  safes: SafeItems
  title: ReactNode
  noSafesMessage?: ReactNode
  action?: ReactElement
  onLinkClick?: () => void
}

const DEFAULT_SHOWN = 5
const MAX_DEFAULT_SHOWN = 7
const PAGE_SIZE = 5

const PaginatedSafeList = ({ safes, title, action, noSafesMessage, onLinkClick }: PaginatedSafeListProps) => {
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
      <div data-sid="89225" className={css.listHeader}>
        <Typography variant="h5" fontWeight={700} mb={2} className={css.listTitle}>
          {title}
          {safes.length > 0 && (
            <Typography component="span" color="var(--color-primary-light)" fontSize="inherit" fontWeight="normal">
              {' '}
              ({safes.length})
            </Typography>
          )}
        </Typography>
        {action}
      </div>
      {shownSafes.length ? (
        shownSafes.map((item) => <AccountItem onLinkClick={onLinkClick} {...item} key={item.chainId + item.address} />)
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={3} mx="auto" width={250}>
          {noSafesMessage}
        </Typography>
      )}
      {safes.length > shownSafes.length && (
        <Box data-sid="84401" display="flex" justifyContent="center">
          <Track {...OVERVIEW_EVENTS.SHOW_MORE_SAFES}>
            <Button data-sid="39314" data-testid="show-more-btn" onClick={onShowMoreSafes}>
              Show more
            </Button>
          </Track>
        </Box>
      )}
    </Paper>
  )
}

export default PaginatedSafeList
