import React from 'react'
import { setCurrentChainId } from '@/store/currentSessionSlice'
import { MenuItem, Select } from '@mui/material'
import { useAppDispatch } from '@/store'
import useChains from '@/services/useChains'
import { useCurrentChainId } from '@/services/useCurrentSession'

const NetworkSelector = () => {
  const dispatch = useAppDispatch()
  const { configs } = useChains()
  const chainId = useCurrentChainId()

  return (
    <Select value={chainId} onChange={(event) => dispatch(setCurrentChainId(event.target.value))}>
      {configs.map((chain) => {
        return (
          <MenuItem key={chain.chainName} value={chain.chainId}>
            {chain.chainName}
          </MenuItem>
        )
      })}
    </Select>
  )
}

export default React.memo(NetworkSelector)
