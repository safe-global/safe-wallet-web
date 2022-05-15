import React from 'react'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import useChains from '@/services/useChains'
import { useRouter } from 'next/router'
import { useCurrentNetwork } from '@/services/useCurrentNetwork'

const NetworkSelector = () => {
  const { configs } = useChains()
  const chain = useCurrentNetwork()
  const router = useRouter()

  const handleNetworkSwitch = (event: SelectChangeEvent) => {
    router.replace({ pathname: router.pathname, query: { ...router.query, chain: event.target.value } })
  }

  return (
    <Select value={chain} onChange={handleNetworkSwitch}>
      {configs.map((chain) => {
        return (
          <MenuItem key={chain.chainId} value={chain.shortName}>
            {chain.chainName}
          </MenuItem>
        )
      })}
    </Select>
  )
}

export default React.memo(NetworkSelector)
