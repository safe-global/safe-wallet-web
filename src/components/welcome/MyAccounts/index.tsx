import { useCallback, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  InputAdornment,
  Link,
  Paper,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material'
import debounce from 'lodash/debounce'
import madProps from '@/utils/mad-props'
import CreateButton from './CreateButton'
import AddIcon from '@/public/images/common/add.svg'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { DataWidget } from '@/components/welcome/MyAccounts/DataWidget'
import css from './styles.module.css'
import SafesList from './SafesList'
import { AppRoutes } from '@/config/routes'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'
import { type AllSafesGrouped, useAllSafesGrouped, type MultiChainSafeItem } from './useAllSafesGrouped'
import { type SafeItem } from './useAllSafes'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import BookmarkIcon from '@/public/images/apps/bookmark.svg'
import classNames from 'classnames'
import { getComparator } from './utils'
import OrderByButton from './OrderByButton'
import SearchIcon from '@/public/images/common/search.svg'
import type { OrderByOption } from '@/store/orderByPreferenceSlice'
import { selectOrderByPreference, setOrderByPreference } from '@/store/orderByPreferenceSlice'
import { useAppDispatch, useAppSelector } from '@/store'
import { useSafesSearch } from './useSafesSearch'
import useTrackSafesCount from './useTrackedSafesCount'

type AccountsListProps = {
  safes: AllSafesGrouped
  isSidebar?: boolean
  onLinkClick?: () => void
}

const AccountsList = ({ safes, onLinkClick, isSidebar = false }: AccountsListProps) => {
  const wallet = useWallet()
  const router = useRouter()
  const { orderBy } = useAppSelector(selectOrderByPreference)
  const dispatch = useAppDispatch()
  const sortComparator = getComparator(orderBy)
  const [searchQuery, setSearchQuery] = useState('')

  const allSafes = useMemo(
    () => [...(safes.allMultiChainSafes ?? []), ...(safes.allSingleSafes ?? [])].sort(sortComparator),
    [safes.allMultiChainSafes, safes.allSingleSafes, sortComparator],
  )
  const filteredSafes = useSafesSearch(allSafes ?? [], searchQuery).sort(sortComparator)

  // We consider a multiChain account owned if at least one of the multiChain accounts is not on the watchlist
  const ownedMultiChainSafes = useMemo(
    () => safes.allMultiChainSafes?.filter((account) => account.safes.some(({ isWatchlist }) => !isWatchlist)),
    [safes],
  )

  // If all safes of a multichain account are on the watchlist we put the entire account on the watchlist
  const watchlistMultiChainSafes = useMemo(
    () => safes.allMultiChainSafes?.filter((account) => !account.safes.some(({ isWatchlist }) => !isWatchlist)),
    [safes],
  )

  const ownedSafes = useMemo<(MultiChainSafeItem | SafeItem)[]>(
    () => [...(ownedMultiChainSafes ?? []), ...(safes.allSingleSafes?.filter(({ isWatchlist }) => !isWatchlist) ?? [])],
    [safes, ownedMultiChainSafes],
  )
  const watchlistSafes = useMemo<(MultiChainSafeItem | SafeItem)[]>(
    () => [
      ...(watchlistMultiChainSafes ?? []),
      ...(safes.allSingleSafes?.filter(({ isWatchlist }) => isWatchlist) ?? []),
    ],
    [safes, watchlistMultiChainSafes],
  )
  const pinnedSafes = useMemo<(MultiChainSafeItem | SafeItem)[]>(
    () => [...(allSafes?.filter(({ isPinned }) => isPinned) ?? [])],
    [allSafes],
  )

  const handleOrderByChange = (orderBy: OrderByOption) => {
    dispatch(setOrderByPreference({ orderBy }))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(debounce(setSearchQuery, 300), [])

  useTrackSafesCount(ownedSafes, watchlistSafes, wallet)

  const isLoginPage = router.pathname === AppRoutes.welcome.accounts
  const trackingLabel = isLoginPage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  return (
    <Box data-testid="sidebar-safe-container" className={css.container}>
      <Box className={classNames(css.myAccounts, { [css.sidebarAccounts]: isSidebar })}>
        <Box className={classNames(css.header, { [css.sidebarHeader]: isSidebar })}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            My accounts
          </Typography>
          <Box className={css.headerButtons}>
            <Track {...OVERVIEW_EVENTS.ADD_TO_WATCHLIST} label={trackingLabel}>
              <Link href={AppRoutes.newSafe.load}>
                <Button
                  disableElevation
                  variant="outlined"
                  size="small"
                  onClick={onLinkClick}
                  startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                  sx={{ height: '36px', width: '100%', px: 2 }}
                >
                  Add
                </Button>
              </Link>
            </Track>
            <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
              <CreateButton isPrimary={!!wallet} />
            </Track>
          </Box>
        </Box>

        <Paper sx={{ padding: 0 }}>
          <Paper sx={{ px: 2, py: 1 }}>
            <Box display="flex" justifyContent="space-between" width="100%" gap={1}>
              <TextField
                id="search-by-name"
                placeholder="Search"
                aria-label="Search Safe list by name"
                variant="filled"
                hiddenLabel
                onChange={(e) => {
                  handleSearch(e.target.value)
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIcon component={SearchIcon} inheritViewBox color="border" fontSize="small" />
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                }}
                fullWidth
                size="small"
              />
              <OrderByButton orderBy={orderBy} onOrderByChange={handleOrderByChange} />
            </Box>
          </Paper>

          {isSidebar && <Divider />}

          <Paper className={css.safeList}>
            {/* Search results */}
            {searchQuery ? (
              <>
                <Typography variant="h5" fontWeight={700} mb={2}>
                  Found {filteredSafes.length} result{filteredSafes.length === 1 ? '' : 's'}
                </Typography>
                <Box mt={1}>
                  <SafesList safes={filteredSafes} onLinkClick={onLinkClick} useTransitions={false} />
                </Box>
              </>
            ) : (
              <>
                {/* Pinned Accounts */}
                <Box mb={2} minHeight="170px">
                  <div className={css.listHeader}>
                    <SvgIcon
                      component={BookmarkIcon}
                      inheritViewBox
                      fontSize="small"
                      sx={{ mt: '2px', mr: 1, strokeWidth: 2 }}
                    />
                    <Typography variant="h5" fontWeight={700} mb={2}>
                      Pinned
                    </Typography>
                  </div>
                  {pinnedSafes.length > 0 ? (
                    <SafesList safes={pinnedSafes} onLinkClick={onLinkClick} />
                  ) : (
                    <Box className={css.noPinnedSafesMessage}>
                      <Typography color="text.secondary" variant="body2" maxWidth="350px" textAlign="center">
                        Personalize your account list by clicking the
                        <SvgIcon
                          component={BookmarkIcon}
                          inheritViewBox
                          fontSize="small"
                          sx={{ mx: '4px', color: 'text.secondary', position: 'relative', top: '2px' }}
                        />
                        icon on the accounts most important to you.
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* All Accounts */}
                <Accordion sx={{ border: 'none' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ '& path': { fill: 'var(--color-text-secondary)' } }} />}
                    sx={{
                      padding: 0,
                      '& .MuiAccordionSummary-content': { margin: '0 !important', mb: 1, flexGrow: 0 },
                    }}
                  >
                    <div className={css.listHeader}>
                      <Typography variant="h5" fontWeight={700}>
                        Accounts
                        {allSafes && allSafes.length > 0 && (
                          <Typography
                            component="span"
                            color="text.secondary"
                            fontSize="inherit"
                            fontWeight="normal"
                            mr={1}
                          >
                            {' '}
                            ({allSafes.length})
                          </Typography>
                        )}
                      </Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: 0 }}>
                    <Box mt={1}>
                      <SafesList safes={allSafes} onLinkClick={onLinkClick} />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </>
            )}
          </Paper>
        </Paper>
        <DataWidget />
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafesGrouped,
})

export default MyAccounts
