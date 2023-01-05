import useChainId from '@/hooks/useChainId'
import useHiddenTokens from '@/hooks/useHiddenTokens'
import { useAppDispatch } from '@/store'
import { setHiddenTokensForChain } from '@/store/settingsSlice'
import { useCallback, useState } from 'react'

// This is the default for MUI Collapse
export const COLLAPSE_TIMEOUT_MS = 300

export const useHideAssets = (closeDialog: () => void) => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()

  const [assetsToHide, setAssetsToHide] = useState<string[]>([])
  const [assetsToUnhide, setAssetsToUnhide] = useState<string[]>([])
  const [hidingAsset, setHidingAsset] = useState<string>()
  const hiddenAssets = useHiddenTokens()

  const toggleAsset = useCallback(
    (address: string) => {
      if (assetsToHide.includes(address)) {
        const newAssetsToHide = [...assetsToHide]
        newAssetsToHide.splice(newAssetsToHide.indexOf(address), 1)
        setAssetsToHide(newAssetsToHide)
        return
      }

      if (assetsToUnhide.includes(address)) {
        const newAssetsToUnhide = [...assetsToUnhide]
        newAssetsToUnhide.splice(newAssetsToUnhide.indexOf(address), 1)
        setAssetsToUnhide(newAssetsToUnhide)
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

  const deselectAll = useCallback(() => {
    setAssetsToHide([])
    setAssetsToUnhide([...hiddenAssets])
  }, [hiddenAssets])

  // Assets are selected if they are either hidden or marked for hiding
  const isAssetSelected = useCallback(
    (address: string) =>
      (hiddenAssets.includes(address) && !assetsToUnhide.includes(address)) || assetsToHide.includes(address),
    [assetsToHide, assetsToUnhide, hiddenAssets],
  )

  const cancel = useCallback(() => {
    setAssetsToHide([])
    setAssetsToUnhide([])
    closeDialog()
  }, [closeDialog])

  const hideAsset = useCallback(
    (address: string) => {
      setHidingAsset(address)
      setTimeout(() => {
        const newHiddenAssets = [...hiddenAssets, address]
        dispatch(setHiddenTokensForChain({ chainId, assets: newHiddenAssets }))
        setHidingAsset(undefined)
      }, COLLAPSE_TIMEOUT_MS)
    },
    [chainId, dispatch, hiddenAssets],
  )

  const saveChanges = useCallback(() => {
    const newHiddenAssets = [...hiddenAssets.filter((asset) => !assetsToUnhide.includes(asset)), ...assetsToHide]
    dispatch(setHiddenTokensForChain({ chainId, assets: newHiddenAssets }))
    cancel()
  }, [assetsToHide, assetsToUnhide, chainId, dispatch, hiddenAssets, cancel])

  return {
    hideAsset,
    saveChanges,
    cancel,
    toggleAsset,
    isAssetSelected,
    deselectAll,
    hidingAsset,
  }
}
