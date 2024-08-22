import { type ReactElement, type ReactNode, useState, useCallback, useEffect, useMemo } from 'react'
import { Paper, Typography } from '@mui/material'
import AccountItem from './AccountItem'
import { type SafeItem } from './useAllSafes'
import css from './styles.module.css'
import useSafeOverviews from './useSafeOverviews'
import { sameAddress } from '@/utils/addresses'
import InfiniteScroll from '@/components/common/InfiniteScroll'
import { type MultiChainSafeItem } from './useAllSafesGrouped'
import MultiAccountItem from './MultiAccountItem'
import { isMultiChainSafeItem } from './utils/multiChainSafe'

type PaginatedSafeListProps = {
  safes?: (SafeItem | MultiChainSafeItem)[]
  title: ReactNode
  noSafesMessage?: ReactNode
  action?: ReactElement
  onLinkClick?: () => void
}

type SafeListPageProps = {
  safes: (SafeItem | MultiChainSafeItem)[]
  onLinkClick: PaginatedSafeListProps['onLinkClick']
}

const PAGE_SIZE = 10

/**
 * Slices Safe list. We need this helper as MultiChainSafeItems can contain multiple Safes.
 *
 * Will always slice in a way that a Account group is not split up.
 */
const sliceSafes = (
  safes: (SafeItem | MultiChainSafeItem)[],
  start: number,
  end?: number,
): (SafeItem | MultiChainSafeItem)[] => {
  // Find start Safe
  const allSafes = safes.flatMap((safe) => (isMultiChainSafeItem(safe) ? safe.safes : safe))
  const slicedSafesAddresses = allSafes.slice(start, end).map((value) => value.address)

  return safes.filter((value) => slicedSafesAddresses.includes(value.address))
}

export const SafeListPage = ({ safes, onLinkClick }: SafeListPageProps) => {
  const flattenedSafes = useMemo(
    () => safes.flatMap((safe) => (isMultiChainSafeItem(safe) ? safe.safes : safe)),
    [safes],
  )
  const [overviews] = useSafeOverviews(flattenedSafes)

  const findOverview = (item: SafeItem) => {
    return overviews?.find(
      (overview) => item.chainId === overview.chainId && sameAddress(overview.address.value, item.address),
    )
  }

  return (
    <>
      {safes.map((item) =>
        isMultiChainSafeItem(item) ? (
          <MultiAccountItem
            onLinkClick={onLinkClick}
            key={item.address}
            multiSafeAccountItem={item}
            safeOverviews={overviews?.filter((overview) => sameAddress(overview.address.value, item.address))}
          />
        ) : (
          <AccountItem
            onLinkClick={onLinkClick}
            safeItem={item}
            safeOverview={findOverview(item)}
            key={item.chainId + item.address}
          />
        ),
      )}
    </>
  )
}

const AllSafeListPages = ({ safes, onLinkClick }: SafeListPageProps) => {
  const totalSafes = safes.reduce(
    (prev, current) => prev + (isMultiChainSafeItem(current) ? current.safes.length : 1),
    0,
  )
  const totalPages = Math.ceil(totalSafes / PAGE_SIZE)
  const [pages, setPages] = useState<(SafeItem | MultiChainSafeItem)[][]>([])

  const onNextPage = useCallback(() => {
    setPages((prev) => {
      const pageIndex = prev.length
      const nextPage = sliceSafes(safes, pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE)
      return prev.concat([nextPage])
    })
  }, [safes])

  useEffect(() => {
    setPages([sliceSafes(safes, 0, PAGE_SIZE)])
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

          {safes && safes.length > 0 && (
            <Typography component="span" color="var(--color-primary-light)" fontSize="inherit" fontWeight="normal">
              {' '}
              ({safes.length})
            </Typography>
          )}
        </Typography>

        {action}
      </div>

      {safes && safes.length > 0 ? (
        <AllSafeListPages safes={safes} onLinkClick={onLinkClick} />
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={3} mx="auto" width={250}>
          {safes ? noSafesMessage : 'Loading...'}
        </Typography>
      )}
    </Paper>
  )
}

export default PaginatedSafeList
