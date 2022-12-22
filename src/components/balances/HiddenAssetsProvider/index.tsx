import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import useHiddenTokens from '@/hooks/useHiddenTokens'
import { useAppDispatch } from '@/store'
import { setHiddenTokensForChain } from '@/store/settingsSlice'
import { type SafeBalanceResponse, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { type ReactElement, type ReactNode, useState, useCallback, useMemo, createContext } from 'react'

type HiddenAssetsContextValue = {
  showHiddenAssets: boolean
  toggleShowHiddenAssets: () => void
  toggleAsset: (address: string) => void
  saveChanges: () => void
  reset: () => void
  isAssetSelected: (address: string) => boolean
  visibleAssets: SafeBalanceResponse['items']
}

export const HiddenAssetsContext = createContext<HiddenAssetsContextValue>({
  showHiddenAssets: false,
  toggleShowHiddenAssets: () => {},
  toggleAsset: () => {},
  saveChanges: () => {},
  reset: () => {},
  isAssetSelected: () => true,
  visibleAssets: [],
})

const HiddenAssetsProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [showHiddenAssets, setShowHiddenAssets] = useState(false)
  const [assetsToHide, setAssetsToHide] = useState<string[]>([])
  const [assetsToUnhide, setAssetsToUnhide] = useState<string[]>([])
  const hiddenAssets = useHiddenTokens()
  const { balances } = useBalances(true)
  const dispatch = useAppDispatch()
  const chainId = useChainId()

  const toggleShowHiddenAssets = useCallback(() => setShowHiddenAssets((prev) => !prev), [])

  const toggleAsset = useCallback(
    (address: string) => {
      if (assetsToHide.includes(address)) {
        assetsToHide.splice(assetsToHide.indexOf(address), 1)
        setAssetsToHide([...assetsToHide])
        return
      }

      if (assetsToUnhide.includes(address)) {
        assetsToUnhide.splice(assetsToUnhide.indexOf(address), 1)
        setAssetsToUnhide([...assetsToUnhide])
        return
      }

      const assetIsHidden = hiddenAssets.includes(address)
      if (!assetIsHidden) {
        setAssetsToHide([...assetsToHide, address])
      } else {
        setAssetsToUnhide([...assetsToUnhide, address])
      }
    },
    [assetsToHide, assetsToUnhide, hiddenAssets],
  )

  // Assets are selected if they are either hidden or marked for hiding
  const isAssetSelected = useCallback(
    (address: string) =>
      (hiddenAssets.includes(address) && !assetsToUnhide.includes(address)) || assetsToHide.includes(address),
    [assetsToHide, assetsToUnhide, hiddenAssets],
  )

  const visibleItems = useMemo(
    () =>
      showHiddenAssets
        ? balances.items?.filter((item) => hiddenAssets.includes(item.tokenInfo.address))
        : balances.items?.filter(
            (item) => item.tokenInfo.type === TokenType.NATIVE_TOKEN || !hiddenAssets.includes(item.tokenInfo.address),
          ),
    [hiddenAssets, balances.items, showHiddenAssets],
  )

  const reset = useCallback(() => {
    setAssetsToHide([])
    setAssetsToUnhide([])
    setShowHiddenAssets(false)
  }, [])

  const saveChanges = useCallback(() => {
    const newHiddenAssets = [...hiddenAssets.filter((asset) => !assetsToUnhide.includes(asset)), ...assetsToHide]
    dispatch(setHiddenTokensForChain({ chainId, assets: newHiddenAssets }))
    reset()
  }, [assetsToHide, assetsToUnhide, chainId, dispatch, hiddenAssets, reset])

  return (
    <HiddenAssetsContext.Provider
      value={{
        showHiddenAssets,
        toggleShowHiddenAssets,
        toggleAsset,
        saveChanges,
        reset,
        isAssetSelected,
        visibleAssets: visibleItems,
      }}
    >
      {children}
    </HiddenAssetsContext.Provider>
  )
}

export default HiddenAssetsProvider
