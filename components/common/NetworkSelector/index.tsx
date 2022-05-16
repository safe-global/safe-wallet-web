import React from 'react'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import useChains, { useCurrentChain } from '@/services/useChains'
import { useRouter } from 'next/router'
import ChainIndicator from '../ChainIndicator'
import css from './styles.module.css'
import { useChainId } from '@/services/useChainId'
import chains from '@/config/chains'

const NetworkSelector = () => {
  const { configs } = useChains()
  const chainId = useChainId()
  const router = useRouter()

  const handleNetworkSwitch = (event: SelectChangeEvent) => {
    const selectedChainId = event.target.value

    router.replace({
      pathname: '/',
      query: {
        chain: chains[selectedChainId],
      },
    })
  }

  return (
    <Select value={chainId} onChange={handleNetworkSwitch} size="small" className={css.select} variant="standard">
      {configs.map((chain) => {
        return (
          <MenuItem key={chain.chainId} value={chain.chainId}>
            <ChainIndicator chainId={chain.chainId} className={css.indicator} />
          </MenuItem>
        )
      })}
    </Select>
  )
}

export default React.memo(NetworkSelector)
