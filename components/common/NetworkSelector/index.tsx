import React from 'react'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import useChains, { useCurrentChain } from '@/services/useChains'
import { useRouter } from 'next/router'
import ChainIndicator from '../ChainIndicator'
import css from './styles.module.css'
import { useCurrentNetwork } from '@/services/useCurrentNetwork'

const NetworkSelector = () => {
  const { configs } = useChains()
  const currentShortName = useCurrentNetwork()
  const router = useRouter()

  const handleNetworkSwitch = (event: SelectChangeEvent) => {
    const selectedSortName = event.target.value

    router.replace({
      pathname: '/',
      query: {
        chain: selectedSortName,
      },
    })
  }

  return (
    <Select
      value={currentShortName}
      onChange={handleNetworkSwitch}
      size="small"
      className={css.select}
      variant="standard"
    >
      {configs.map((chain) => {
        return (
          <MenuItem key={chain.chainId} value={chain.shortName}>
            <ChainIndicator chainId={chain.chainId} className={css.indicator} />
          </MenuItem>
        )
      })}
    </Select>
  )
}

export default React.memo(NetworkSelector)
