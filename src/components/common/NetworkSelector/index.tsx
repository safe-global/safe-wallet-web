import ChainIndicator from '@/components/common/ChainIndicator'
import { AppRoutes } from '@/config/routes'
import { useChainId } from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'
import { useDarkMode } from '@/hooks/useDarkMode'
import useSwitchChain from '@/hooks/useSwitchChain'
import useWallet from '@/hooks/wallets/useWallet'
import { isSocialWalletEnabled } from '@/hooks/wallets/wallets'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { SelectChangeEvent } from '@mui/material'
import { ListSubheader, MenuItem, Select, Skeleton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import partition from 'lodash/partition'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useMemo, type ReactElement } from 'react'
import css from './styles.module.css'

const NetworkSelector = (props: { onChainSelect?: () => void }): ReactElement => {
  const wallet = useWallet()
  const isDarkMode = useDarkMode()
  const theme = useTheme()
  const { configs } = useChains()
  const chainId = useChainId()
  const router = useRouter()

  const [testNets, prodNets] = useMemo(() => partition(configs, (config) => config.isTestnet), [configs])

  const { switchChain } = useSwitchChain()

  const getNetworkLink = useCallback(
    (shortName: string) => {
      const shouldKeepPath = !router.query.safe

      const route = {
        pathname: shouldKeepPath ? router.pathname : AppRoutes.index,
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
    [router],
  )

  const onChange = (event: SelectChangeEvent) => {
    event.preventDefault() // Prevent the link click

    const newChainId = event.target.value
    const shortName = configs.find((item) => item.chainId === newChainId)?.shortName

    if (shortName) {
      switchChain(Number(newChainId)).then(() => {
        router.push(getNetworkLink(shortName))
      })
    }
  }

  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  const renderMenuItem = useCallback(
    (value: string, chain: ChainInfo) => {
      return (
        <MenuItem
          key={value}
          value={value}
          className={css.menuItem}
          disabled={isSocialLogin && !isSocialWalletEnabled(chain)}
        >
          <Link href={getNetworkLink(chain.shortName)} onClick={props.onChainSelect} className={css.item}>
            <ChainIndicator chainId={chain.chainId} inline />
          </Link>
        </MenuItem>
      )
    },
    [getNetworkLink, isSocialLogin, props.onChainSelect],
  )

  return configs.length ? (
    <Select
      value={chainId}
      onChange={onChange}
      size="small"
      className={css.select}
      variant="standard"
      IconComponent={ExpandMoreIcon}
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
      {prodNets.map((chain) => renderMenuItem(chain.chainId, chain))}

      <ListSubheader className={css.listSubHeader}>Testnets</ListSubheader>

      {testNets.map((chain) => renderMenuItem(chain.chainId, chain))}
    </Select>
  ) : (
    <Skeleton width={94} height={31} sx={{ mx: 2 }} />
  )
}

export default NetworkSelector
