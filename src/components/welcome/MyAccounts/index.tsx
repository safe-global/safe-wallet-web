import { useMemo } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, SvgIcon, Typography } from '@mui/material'
import madProps from '@/utils/mad-props'
import CreateButton from './CreateButton'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { DataWidget } from '@/components/welcome/MyAccounts/DataWidget'
import css from './styles.module.css'
import { SafesList } from './PaginatedSafeList'
import { AppRoutes } from '@/config/routes'
import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'
import useTrackSafesCount from './useTrackedSafesCount'
import { type AllSafesGrouped, useAllSafesGrouped, type MultiChainSafeItem } from './useAllSafesGrouped'
import { type SafeItem } from './useAllSafes'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import BookmarkIcon from '@/public/images/apps/bookmark.svg'

const NO_SAFES_MESSAGE = "You don't have any Safe Accounts yet"

type AccountsListProps = {
  safes: AllSafesGrouped
  onLinkClick?: () => void
}
const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const wallet = useWallet()
  const router = useRouter()
  const allSafes = [...(safes.allMultiChainSafes ?? []), ...(safes.allSingleSafes ?? [])]

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
    () => [
      ...(safes.allSingleSafes?.filter(({ isPinned }) => isPinned) ?? []),
      ...(safes.allMultiChainSafes?.filter(({ isPinned }) => isPinned) ?? []),
    ],
    [safes],
  )

  useTrackSafesCount(ownedSafes, watchlistSafes, wallet)

  const isLoginPage = router.pathname === AppRoutes.welcome.accounts
  const trackingLabel = isLoginPage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  return (
    <Box data-testid="sidebar-safe-container" className={css.container}>
      <Box className={css.myAccounts}>
        <Box className={css.header}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            Safe accounts
          </Typography>
          <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
            <CreateButton isPrimary={!!wallet} />
          </Track>
        </Box>

        <Paper className={css.safeList}>
          {/* Pinned Accounts */}
          <Box mb={3} sx={{ minHeight: '200px' }}>
            <div className={css.listHeader}>
              <SvgIcon
                component={BookmarkIcon}
                inheritViewBox
                fontSize="small"
                sx={{ mt: '2px', mr: 1, fontWeight: 900, strokeWidth: 2 }}
              />
              <Typography variant="h5" fontWeight={700} mb={2}>
                Pinned
              </Typography>
            </div>
            <SafesList safes={pinnedSafes} onLinkClick={onLinkClick} />
          </Box>

          {/* All Accounts */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
              <div className={css.listHeader}>
                <Typography variant="h5" fontWeight={700} mb={2} className={css.listTitle}>
                  Accounts
                  {allSafes && allSafes.length > 0 && (
                    <Typography
                      component="span"
                      color="var(--color-primary-light)"
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
            <AccordionDetails>
              <Box mt={1}>
                <SafesList
                  safes={allSafes}
                  onLinkClick={onLinkClick}
                  noSafesMessage={
                    wallet ? (
                      NO_SAFES_MESSAGE
                    ) : (
                      <>
                        <Box mb={2}>Connect a wallet to view your Safe Accounts or to create a new one</Box>
                        <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD} label={trackingLabel}>
                          <ConnectWalletButton text="Connect a wallet" contained />
                        </Track>
                      </>
                    )
                  }
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* <PaginatedSafeList
          title={
            <>
              <VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: '10px' }} fontSize="small" />
              Watchlist
            </>
          }
          safes={watchlistSafes || []}
          action={
            <Track {...OVERVIEW_EVENTS.ADD_TO_WATCHLIST} label={trackingLabel}>
              <Link href={AppRoutes.newSafe.load}>
                <Button
                  disableElevation
                  size="small"
                  onClick={onLinkClick}
                  startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                >
                  Add
                </Button>
              </Link>
            </Track>
          }
          noSafesMessage={NO_WATCHED_MESSAGE}
          onLinkClick={onLinkClick}
        /> */}

          <DataWidget />
        </Paper>
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafesGrouped,
})

export default MyAccounts
