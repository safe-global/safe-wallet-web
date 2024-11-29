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
import CreateButton from '@/features/myAccounts/components/CreateButton'
import AddIcon from '@/public/images/common/add.svg'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import css from '@/features/myAccounts/styles.module.css'
import SafesList from '@/features/myAccounts/components/SafesList'
import { AppRoutes } from '@/config/routes'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'
import {
  type AllSafesGrouped,
  useAllSafesGrouped,
  type MultiChainSafeItem,
} from '@/features/myAccounts/hooks/useAllSafesGrouped'
import { type SafeItem } from '@/features/myAccounts/hooks/useAllSafes'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import BookmarkIcon from '@/public/images/apps/bookmark.svg'
import classNames from 'classnames'
import { getComparator } from '@/features/myAccounts/utils/utils'
import SearchIcon from '@/public/images/common/search.svg'
import type { OrderByOption } from '@/store/orderByPreferenceSlice'
import { selectOrderByPreference, setOrderByPreference } from '@/store/orderByPreferenceSlice'
import { useAppDispatch, useAppSelector } from '@/store'
import { useSafesSearch } from '@/features/myAccounts/hooks/useSafesSearch'
import useTrackSafesCount from '@/features/myAccounts/hooks/useTrackedSafesCount'
import { DataWidget } from '@/features/myAccounts/components/DataWidget'
import OrderByButton from '@/features/myAccounts/components/OrderByButton'
import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'

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

  const pinnedSafes = useMemo<(MultiChainSafeItem | SafeItem)[]>(
    () => [...(allSafes?.filter(({ isPinned }) => isPinned) ?? [])],
    [allSafes],
  )

  const handleOrderByChange = (orderBy: OrderByOption) => {
    dispatch(setOrderByPreference({ orderBy }))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(debounce(setSearchQuery, 300), [])

  useTrackSafesCount(safes, pinnedSafes, wallet)

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

            {wallet ? (
              <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
                <CreateButton isPrimary />
              </Track>
            ) : (
              <Box sx={{ '& button': { height: '36px' } }}>
                <ConnectWalletButton small={true} />
              </Box>
            )}
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
                      <SvgIcon
                        component={SearchIcon}
                        inheritViewBox
                        fontWeight="bold"
                        fontSize="small"
                        sx={{
                          color: 'var(--color-border-main)',
                          '.MuiInputBase-root.Mui-focused &': { color: 'var(--color-text-primary)' },
                        }}
                      />
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
            {searchQuery ? (
              <>
                {/* Search results */}
                <Typography variant="h5" fontWeight="normal" mb={2} color="primary.light">
                  Found {filteredSafes.length} result{filteredSafes.length === 1 ? '' : 's'}
                </Typography>
                <Box mt={1}>
                  <SafesList safes={filteredSafes} onLinkClick={onLinkClick} useTransitions={false} />
                </Box>
              </>
            ) : (
              <>
                {/* Pinned Accounts */}
                <Box data-testid="pinned-accounts" mb={2} minHeight="170px">
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
                    <Box data-testid="empty-pinned-list" className={css.noPinnedSafesMessage}>
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
                <Accordion sx={{ border: 'none' }} defaultExpanded={!isSidebar}>
                  <AccordionSummary
                    data-testid="expand-safes-list"
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
                  <AccordionDetails data-testid="accounts-list" sx={{ padding: 0 }}>
                    {allSafes.length > 0 ? (
                      <Box mt={1}>
                        <SafesList safes={allSafes} onLinkClick={onLinkClick} />
                      </Box>
                    ) : (
                      <Typography
                        data-testid="empty-account-list"
                        component="div"
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        py={3}
                        mx="auto"
                        width={250}
                      >
                        {!wallet ? (
                          <>
                            <Box mb={2}>Connect a wallet to view your Safe Accounts or to create a new one</Box>
                            <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD} label={trackingLabel}>
                              <ConnectWalletButton text="Connect a wallet" contained />
                            </Track>
                          </>
                        ) : (
                          "You don't have any safes yet"
                        )}
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </>
            )}
          </Paper>
        </Paper>
        {isSidebar && <Divider />}
        <DataWidget />
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafesGrouped,
})

export default MyAccounts
