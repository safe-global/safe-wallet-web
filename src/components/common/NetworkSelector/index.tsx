import ChainIndicator from '@/components/common/ChainIndicator'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import type { SelectChangeEvent } from '@mui/material'
import { ListSubheader, MenuItem, Select, Skeleton } from '@mui/material'
import partition from 'lodash/partition'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useChains from '@/hooks/useChains'
import { useRouter } from 'next/router'
import css from './styles.module.css'
import { useChainId } from '@/hooks/useChainId'
import { type ReactElement, useMemo } from 'react'
import { useCallback } from 'react'
import { AppRoutes } from '@/config/routes'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppSelector } from '@/store'
import { selectChains } from '@/store/chainsSlice'

const NetworkSelector = (props: { onChainSelect?: () => void }): ReactElement => {
  const isDarkMode = useDarkMode()
  const theme = useTheme()
  const { configs } = useChains()
  const chainId = useChainId()
  const router = useRouter()
  const isWalletConnected = !!useWallet()
  const [testNets, prodNets] = useMemo(() => partition(configs, (config) => config.isTestnet), [configs])
  const chains = useAppSelector(selectChains)

  const getNetworkLink = useCallback(
    (shortName: string) => {
      const shouldKeepPath = !router.query.safe

      const route = {
        pathname: shouldKeepPath
          ? router.pathname
          : isWalletConnected
          ? AppRoutes.welcome.accounts
          : AppRoutes.welcome.index,
        query: {
          chain: shortName,
        } as {
          chain: string
          safeViewRedirectURL?: string
        },
      }

      if (router.query?.safeViewRedirectURL) {
        route.query.safeViewRedirectURL = router.query?.safeViewRedirectURL.toString()
      }

      return route
    },
    [router, isWalletConnected],
  )

  const onChange = (event: SelectChangeEvent) => {
    event.preventDefault() // Prevent the link click

    const newChainId = event.target.value
    const shortName = configs.find((item) => item.chainId === newChainId)?.shortName

    if (shortName) {
      trackEvent({ ...OVERVIEW_EVENTS.SWITCH_NETWORK, label: newChainId })
      router.push(getNetworkLink(shortName))
    }
  }

  const renderMenuItem = useCallback(
    (chainId: string, isSelected: boolean) => {
      const chain = chains.data.find((chain) => chain.chainId === chainId)
      if (!chain) return null
      return (
        <MenuItem key={chainId} value={chainId} sx={{ '&:hover': { backgroundColor: 'inherit' } }}>
          <Link href={getNetworkLink(chain.shortName)} onClick={props.onChainSelect} className={css.item}>
            <ChainIndicator responsive={isSelected} chainId={chain.chainId} inline />
          </Link>
        </MenuItem>
      )
    },
    [chains.data, getNetworkLink, props.onChainSelect],
  )

  return configs.length ? (
    <Select
      value={chainId}
      onChange={onChange}
      size="small"
      className={css.select}
      variant="standard"
      IconComponent={ExpandMoreIcon}
      renderValue={(value) => renderMenuItem(value, true)}
      MenuProps={{
        transitionDuration: 0,
        sx: {
          '& .MuiPaper-root': {
            overflow: 'auto',
          },
          ...(isDarkMode
            ? {
                '& .Mui-selected, & .Mui-selected:hover': {
                  backgroundColor: `${theme.palette.secondary.background} !important`,
                },
              }
            : {}),
        },
      }}
      sx={{
        '& .MuiSelect-select': {
          py: 0,
        },
      }}
    >
      {prodNets.map((chain) => renderMenuItem(chain.chainId, false))}

      <ListSubheader className={css.listSubHeader}>Testnets</ListSubheader>

      {testNets.map((chain) => renderMenuItem(chain.chainId, false))}
    </Select>
  ) : (
    <Skeleton width={94} height={31} sx={{ mx: 2 }} />
  )
}

export default NetworkSelector
