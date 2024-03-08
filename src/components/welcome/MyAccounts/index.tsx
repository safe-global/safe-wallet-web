import React, { type BaseSyntheticEvent, useEffect, useMemo } from 'react'
import { Box, Button, Link, SvgIcon, Typography, Tabs, Tab, TextField } from '@mui/material'
import madProps from '@/utils/mad-props'
import CreateButton from './CreateButton'
import useAllSafes, { type SafeItems } from './useAllSafes'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { DataWidget } from '@/components/welcome/MyAccounts/DataWidget'
import css from './styles.module.css'
import PaginatedSafeList from './PaginatedSafeList'
import { VisibilityOutlined } from '@mui/icons-material'
import AddIcon from '@/public/images/common/add.svg'
import { AppRoutes } from '@/config/routes'
import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'
import useTrackSafesCount from './useTrackedSafesCount'
import { useAppSelector } from '@/store'
import { selectAllVisitedSafesOrderedByTimestamp } from '@/store/visitedSafesSlice'
import inputCss from '@/styles/inputs.module.css'
import { FormProvider, useForm } from 'react-hook-form'
import Fuse from 'fuse.js'

const NO_SAFES_MESSAGE = "You don't have any Safe Accounts yet"

type AccountsListProps = {
  safes: SafeItems | undefined
  onLinkClick?: () => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const ownedSafes = useMemo(() => safes?.filter(({ isWatchlist }) => !isWatchlist), [safes])
  const watchlistSafes = useMemo(() => safes?.filter(({ isWatchlist }) => isWatchlist), [safes])
  const visitedSafes = useAppSelector(selectAllVisitedSafesOrderedByTimestamp)
  console.log('visited safes', visitedSafes)
  const wallet = useWallet()
  const router = useRouter()

  const [searchMatchOwned, setSearchMatchOwned] = React.useState<SafeItems>([])
  const [searchMatchWatchlist, setSearchMatchWatchlist] = React.useState<SafeItems>([])
  const [searchMatchVisited, setSearchMatchVisited] = React.useState<SafeItems>([])

  useTrackSafesCount(ownedSafes, watchlistSafes)

  const isLoginPage = router.pathname === AppRoutes.welcome.accounts
  const trackingLabel = isLoginPage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  const [value, setValue] = React.useState(0)

  // const { register, formState } = useFormContext() || {}

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    }
  }

  const methods = useForm({
    defaultValues: {
      search: '',
    },

    mode: 'onChange',
  })

  const searchInput = methods.watch('search')

  const fuseOwned = useMemo(
    () =>
      // @ts-ignore
      new Fuse(ownedSafes, {
        keys: [
          {
            name: 'name',
            weight: 0.99,
          },
          {
            name: 'address',
            weight: 0.99,
          },
        ],
        // https://fusejs.io/api/options.html#threshold
        // Very naive explanation: threshold represents how accurate the search results should be. The default is 0.6
        // I tested it and found it to make the search results more accurate when the threshold is 0.3
        // 0 - 1, where 0 is the exact match and 1 matches anything
        threshold: 0.3,
        findAllMatches: true,
      }),
    [ownedSafes],
  )

  const fuseWatchlist = useMemo(
    () =>
      // @ts-ignore
      new Fuse(watchlistSafes, {
        keys: [
          {
            name: 'name',
            weight: 0.99,
          },
          {
            name: 'address',
            weight: 0.99,
          },
        ],
        threshold: 0.3,
        findAllMatches: true,
      }),
    [watchlistSafes],
  )

  const fuseVisited = useMemo(
    () =>
      // @ts-ignore
      new Fuse(visitedSafes, {
        keys: [
          {
            name: 'name',
            weight: 0.99,
          },
          {
            name: 'address',
            weight: 0.99,
          },
        ],
        threshold: 0.3,
        includeMatches: true,
        findAllMatches: true,
      }),
    [visitedSafes],
  )

  useEffect(() => {
    console.log('search input changed', searchInput)

    if (searchInput) {
      const ownedResults = fuseOwned.search(searchInput)
      console.log('owned results', ownedResults)
      setSearchMatchOwned(ownedResults.map((result) => result.item))
      const watchlistResults = fuseWatchlist.search(searchInput)
      setSearchMatchWatchlist(watchlistResults.map((result) => result.item))
      console.log('watchlist results', watchlistResults)
      const visitedResults = fuseVisited.search(searchInput)
      console.log('visited results', visitedResults)
      setSearchMatchVisited(visitedResults.map((result) => result.item))
    } else {
      setSearchMatchOwned([])
      setSearchMatchWatchlist([])
      setSearchMatchVisited([])
    }
  }, [searchInput, fuseOwned, fuseWatchlist, fuseVisited])
  // console.log('search input', searchInput)
  const onSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault()
  }

  return (
    <Box data-testid="sidebar-safe-container" className={css.container}>
      <Box className={css.myAccounts}>
        <Box sx={{ width: '100%' }}>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              <TextField
                variant="outlined"
                label={'Search for a safe'}
                fullWidth
                className={inputCss.input}
                {...methods.register('search')}
              />
            </form>
          </FormProvider>

          {!searchInput ? (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                  <Tab label="My safes" {...a11yProps(0)} />
                  <Tab label="Favorites" {...a11yProps(1)} />
                  <Tab label="History" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                <Box className={css.header}>
                  <Typography variant="h1" fontWeight={700} className={css.title}>
                    Safe accounts
                  </Typography>
                  <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
                    <CreateButton />
                  </Track>
                </Box>

                <PaginatedSafeList
                  title="My accounts"
                  safes={ownedSafes || []}
                  onLinkClick={onLinkClick}
                  noSafesMessage={
                    wallet ? (
                      'No owned safes match your search'
                    ) : (
                      <>
                        <Box mb={2}>Connect a wallet to view your Safe Accounts or to create a new one</Box>
                        <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD} label={trackingLabel}>
                          <ConnectWalletButton text="Connect a wallet" contained={false} />
                        </Track>
                      </>
                    )
                  }
                />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <PaginatedSafeList
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
                  noSafesMessage={'No safes in your favorites match your search'}
                  onLinkClick={onLinkClick}
                />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                <PaginatedSafeList
                  safes={visitedSafes}
                  title={
                    <>
                      <VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: '10px' }} fontSize="small" />
                      History
                    </>
                  }
                  noSafesMessage={'No safes in your history match your search'}
                />
              </CustomTabPanel>
            </>
          ) : (
            <>
              <PaginatedSafeList
                title="My accounts"
                safes={searchMatchOwned}
                onLinkClick={onLinkClick}
                noSafesMessage={
                  wallet ? (
                    NO_SAFES_MESSAGE
                  ) : (
                    <>
                      <Box mb={2}>Connect a wallet to view your Safe Accounts or to create a new one</Box>
                      <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD} label={trackingLabel}>
                        <ConnectWalletButton text="Connect a wallet" contained={false} />
                      </Track>
                    </>
                  )
                }
              />
              <PaginatedSafeList
                title={
                  <>
                    <VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: '10px' }} fontSize="small" />
                    Watchlist
                  </>
                }
                safes={searchMatchWatchlist}
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
                noSafesMessage={NO_SAFES_MESSAGE}
                onLinkClick={onLinkClick}
              />
              <PaginatedSafeList
                safes={searchMatchVisited}
                title={
                  <>
                    <VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: '10px' }} fontSize="small" />
                    History
                  </>
                }
                noSafesMessage={"You haven't visited any safes yet"}
              />
            </>
          )}
        </Box>

        <DataWidget />
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafes,
})

export default MyAccounts
