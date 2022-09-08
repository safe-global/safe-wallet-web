import { MenuItem, Select, SelectChangeEvent, Skeleton } from '@mui/material'
import useChains from '@/hooks/useChains'
import { useRouter } from 'next/router'
import ChainIndicator from '../ChainIndicator'
import css from './styles.module.css'
import { useChainId } from '@/hooks/useChainId'
import chains from '@/config/chains'
import { ReactElement } from 'react'
import { AppRoutes } from '@/config/routes'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'
import { selectSession } from '@/store/sessionSlice'
import { useAppSelector } from '@/store'

const NetworkSelector = (): ReactElement => {
  const { configs } = useChains()
  const chainId = useChainId()
  const router = useRouter()
  const session = useAppSelector(selectSession)

  const handleNetworkSwitch = (event: SelectChangeEvent) => {
    const selectedChainId = event.target.value
    const newShortName = Object.entries(chains).find(([, val]) => val === selectedChainId)?.[0]

    if (!newShortName) return

    trackEvent({ ...OVERVIEW_EVENTS.SWITCH_NETWORK, label: selectedChainId })

    const shouldKeepPath = [AppRoutes.welcome, AppRoutes.load, AppRoutes.open].includes(router.pathname)

    const lastUsedSafe = session.lastSafeAddress[selectedChainId]

    const query = lastUsedSafe ? { safe: `${newShortName}:${lastUsedSafe}` } : { chain: newShortName }

    return router.push({
      pathname: shouldKeepPath ? router.pathname : AppRoutes.index,
      query,
    })
  }

  return configs.length ? (
    <Select value={chainId} onChange={handleNetworkSwitch} size="small" className={css.select} variant="standard">
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
