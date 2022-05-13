import React from 'react'
import { setCurrentChainId } from '@/store/currentSessionSlice'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { useAppDispatch } from '@/store'
import useChains from '@/services/useChains'
import { useCurrentChainId } from '@/services/useCurrentSession'

const NetworkSelector = () => {
  const dispatch = useAppDispatch()
  const { configs } = useChains()
  const chainId = useCurrentChainId()

  const handleNetworkSwitch = (event: SelectChangeEvent) => {
    dispatch(setCurrentChainId(event.target.value))
  }

  return (
    <Select value={chainId} onChange={handleNetworkSwitch}>
      {configs.map((chain) => {
        return (
          <MenuItem key={chain.chainId} value={chain.chainId}>
            {chain.chainName}
          </MenuItem>
        )
      })}
    </Select>
  )
}

export default React.memo(NetworkSelector)
