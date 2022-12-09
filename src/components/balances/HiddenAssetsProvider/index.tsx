import useChainId from '@/hooks/useChainId'
import { useHiddenAssets } from '@/hooks/useHiddenAssets'
import { useAppDispatch } from '@/store'
import { addHiddenAssets, removeHiddenAssets } from '@/store/hiddenAssetsSlice'
import { type ReactElement, type ReactNode, useState, useCallback } from 'react'
import { createContext } from 'react'

export const HiddenAssetsContext = createContext<{
  showHiddenAssets: boolean
  toggleShowHiddenAssets: () => void
  toggleAsset: (address: string) => void
  assetsToHide: string[]
  assetsToUnhide: string[]
  saveChanges: () => void
  reset: () => void
}>({
  showHiddenAssets: false,
  toggleShowHiddenAssets: () => {},
  toggleAsset: () => {},
  assetsToHide: [],
  assetsToUnhide: [],
  saveChanges: () => {},
  reset: () => {},
})

const HiddenAssetsProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [showHiddenAssets, setShowHiddenAssets] = useState(false)
  const [assetsToHide, setAssetsToHide] = useState<string[]>([])
  const [assetsToUnhide, setAssetsToUnhide] = useState<string[]>([])
  const hiddenAssets = useHiddenAssets()
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
        assetsToHide,
        assetsToUnhide,
        saveChanges,
        reset,
      }}
    >
      {children}
    </HiddenAssetsContext.Provider>
  )
}

export default HiddenAssetsProvider
