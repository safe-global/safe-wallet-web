import React from 'react'
import { AccountItem } from '../AccountItem'
import { SafesSliceItem } from '@/src/store/safesSlice'
import { Address } from '@/src/types/address'
import { useDispatch, useSelector } from 'react-redux'
import { selectActiveSafe, setActiveSafe } from '@/src/store/activeSafeSlice'
import { getChainsByIds } from '@/src/store/chains'
import { RootState } from '@/src/store'
import { switchActiveChain } from '@/src/store/activeChainSlice'
import { useMyAccountsService } from './hooks/useMyAccountsService'

interface MyAccountsContainerProps {
  item: SafesSliceItem
  onClose: () => void
}

export function MyAccountsContainer({ item, onClose }: MyAccountsContainerProps) {
  useMyAccountsService(item)

  const dispatch = useDispatch()
  const activeSafe = useSelector(selectActiveSafe)
  const filteredChains = useSelector((state: RootState) => getChainsByIds(state, item.chains))

  const handleAccountSelected = () => {
    const chainId = item.chains[0]

    dispatch(
      setActiveSafe({
        address: item.SafeInfo.address.value as Address,
        chainId,
      }),
    )
    dispatch(switchActiveChain({ id: chainId }))

    onClose()
  }

  return (
    <AccountItem
      account={item.SafeInfo}
      chains={filteredChains}
      onSelect={handleAccountSelected}
      activeAccount={activeSafe.address}
    />
  )
}
