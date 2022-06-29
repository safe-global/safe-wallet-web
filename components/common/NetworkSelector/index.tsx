import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import useChains from '@/hooks/useChains'
import { useRouter } from 'next/router'
import ChainIndicator from '../ChainIndicator'
import css from './styles.module.css'
import { useChainId } from '@/hooks/useChainId'
import chains from '@/config/chains'
import { ReactElement } from 'react'

const NetworkSelector = (): ReactElement | null => {
  const { configs } = useChains()
  const chainId = useChainId()
  const router = useRouter()

  const handleNetworkSwitch = (event: SelectChangeEvent) => {
    const selectedChainId = event.target.value
    const newShortName = Object.entries(chains).find(([, val]) => val === selectedChainId)?.[0]

    if (!newShortName) return

    router.replace({
      pathname: '/',
      query: {
        chain: newShortName,
      },
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
  ) : null
}

export default NetworkSelector
