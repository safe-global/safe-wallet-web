import { MenuItem, Select, SelectChangeEvent, Skeleton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useChains from '@/hooks/useChains'
import { useRouter } from 'next/router'
import ChainIndicator from '../ChainIndicator'
import css from './styles.module.css'
import { useChainId } from '@/hooks/useChainId'
import chains from '@/config/chains'
import { ReactElement } from 'react'
import { AppRoutes } from '@/config/routes'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'

const NetworkSelector = (): ReactElement => {
  const { configs } = useChains()
  const chainId = useChainId()
  const router = useRouter()

  const handleNetworkSwitch = (event: SelectChangeEvent) => {
    const selectedChainId = event.target.value
    const newShortName = Object.entries(chains).find(([, val]) => val === selectedChainId)?.[0]

    if (!newShortName) return

    trackEvent({ ...OVERVIEW_EVENTS.SWITCH_NETWORK, label: selectedChainId })

    const shouldKeepPath = [AppRoutes.welcome, AppRoutes.load, AppRoutes.open].includes(router.pathname)

    return router.push({
      pathname: shouldKeepPath ? router.pathname : '/',
      query: {
        chain: newShortName,
      },
    })
  }

  return configs.length ? (
    <Select
      value={chainId}
      onChange={handleNetworkSwitch}
      size="small"
      className={css.select}
      variant="standard"
      IconComponent={ExpandMoreIcon}
      MenuProps={{
        sx: {
          '& .MuiPaper-root': {
            mt: 2,
            border: ({ palette }) => `1px solid ${palette.border.light}`,
          },
        },
      }}
      sx={{
        '& svg path': {
          fill: ({ palette }) => palette.border.main,
        },
      }}
    >
      {configs.map((chain) => {
        return (
          <MenuItem key={chain.chainId} value={chain.chainId}>
            <ChainIndicator chainId={chain.chainId} inline />
          </MenuItem>
        )
      })}
    </Select>
  ) : (
    <Skeleton width={94} height={31} />
  )
}

export default NetworkSelector
