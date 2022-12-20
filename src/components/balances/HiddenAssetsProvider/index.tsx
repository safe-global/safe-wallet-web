import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import useHiddenAssets from '@/hooks/useHiddenAssets'
import { useAppDispatch } from '@/store'
import { addHiddenAssets, removeHiddenAssets } from '@/store/hiddenAssetsSlice'
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
  const hiddenAssets = useHiddenAssets()
  const { balances } = useBalances(true)
  const dispatch = useAppDispatch()
  const chainId = useChainId()

  const toggleShowHiddenAssets = () => setShowHiddenAssets((prev) => !prev)

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

      const assetIsHidden = hiddenAssets && typeof hiddenAssets[address] !== 'undefined'
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
      (hiddenAssets && typeof hiddenAssets[address] !== 'undefined' && !assetsToUnhide.includes(address)) ||
      assetsToHide.includes(address),
    [assetsToHide, assetsToUnhide, hiddenAssets],
  )

  const visibleItems = useMemo(
    () =>
      showHiddenAssets
        ? balances.items?.filter((item) => typeof hiddenAssets?.[item.tokenInfo.address] !== 'undefined')
        : balances.items?.filter(
            (item) =>
              item.tokenInfo.type === TokenType.NATIVE_TOKEN ||
              typeof hiddenAssets?.[item.tokenInfo.address] === 'undefined',
          ),
    [hiddenAssets, balances.items, showHiddenAssets],
  )

  const reset = useCallback(() => {
    setAssetsToHide([])
    setAssetsToUnhide([])
    setShowHiddenAssets(false)
  }, [])

  const saveChanges = useCallback(() => {
    if (assetsToHide.length > 0) {
      dispatch(addHiddenAssets({ chainId, assets: assetsToHide }))
    }

    if (assetsToUnhide.length > 0) {
      dispatch(removeHiddenAssets({ chainId, assetAddresses: assetsToUnhide }))
    }

    reset()
  }, [assetsToHide, assetsToUnhide, chainId, dispatch, reset])

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
