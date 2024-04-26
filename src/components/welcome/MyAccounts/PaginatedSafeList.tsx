import { type ReactElement, type ReactNode, useState, useCallback, useEffect } from 'react'
import { Paper, Typography } from '@mui/material'
import AccountItem from './AccountItem'
import { type SafeItem } from './useAllSafes'
import css from './styles.module.css'
import useSafeOverviews from './useSafeOverviews'
import { sameAddress } from '@/utils/addresses'
import InfiniteScroll from '@/components/common/InfiniteScroll'

type PaginatedSafeListProps = {
  safes: SafeItem[]
  title: ReactNode
  noSafesMessage?: ReactNode
  action?: ReactElement
  onLinkClick?: () => void
}

type SafeListPageProps = {
  safes: SafeItem[]
  onLinkClick: PaginatedSafeListProps['onLinkClick']
}

const PAGE_SIZE = 10

const SafeListPage = ({ safes, onLinkClick }: SafeListPageProps) => {
  const [overviews] = useSafeOverviews(safes)

  const findOverview = (item: SafeItem) => {
    return overviews?.find((overview) => sameAddress(overview.address.value, item.address))
  }

  return (
    <>
      {safes.map((item) => (
        <AccountItem
          onLinkClick={onLinkClick}
          safeItem={item}
          safeOverview={findOverview(item)}
          key={item.chainId + item.address}
        />
      ))}
    </>
  )
}

const AllSafeListPages = ({ safes, onLinkClick }: SafeListPageProps) => {
  const totalPages = Math.ceil(safes.length / PAGE_SIZE)
  const [pages, setPages] = useState<SafeItem[][]>([])

  const onNextPage = useCallback(() => {
    setPages((prev) => {
      const pageIndex = prev.length
      const nextPage = safes.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE)
      return prev.concat([nextPage])
    })
  }, [safes])

  useEffect(() => {
    setPages([safes.slice(0, PAGE_SIZE)])
  }, [safes])

  return (
    <>
      {pages.map((pageSafes, index) => (
        <SafeListPage key={index} safes={pageSafes} onLinkClick={onLinkClick} />
      ))}

      {totalPages > pages.length && <InfiniteScroll onLoadMore={onNextPage} key={pages.length} />}
    </>
  )
}

const PaginatedSafeList = ({ safes, title, action, noSafesMessage, onLinkClick }: PaginatedSafeListProps) => {
  return (
    <Paper className={css.safeList}>
      <div className={css.listHeader}>
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

      {safes.length > 0 ? (
        <AllSafeListPages safes={safes} onLinkClick={onLinkClick} />
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={3} mx="auto" width={250}>
          {noSafesMessage}
        </Typography>
      )}
    </Paper>
  )
}

export default PaginatedSafeList
