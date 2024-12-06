import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectActiveChain } from '@/src/store/activeChainSlice'
import { setActiveSafe } from '@/src/store/activeSafeSlice'
import { Address } from '@/src/types/address'
import { AppSettings } from './AppSettings'

export const AppSettingsContainer = () => {
  const dispatch = useDispatch()
  const activeChain = useSelector(selectActiveChain)
  const [safeAddress, setSafeAddress] = useState('')

  const handleSubmit = () => {
    dispatch(
      setActiveSafe({
        chainId: activeChain.chainId,
        address: safeAddress as Address,
      }),
    )
  }
  return <AppSettings onSubmit={handleSubmit} address={safeAddress} onAddressChange={setSafeAddress} />
}
