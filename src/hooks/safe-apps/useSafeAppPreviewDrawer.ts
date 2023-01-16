import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { useState } from 'react'

type ReturnType = {
  isPreviewDrawerOpen: boolean
  previewDrawerApp: SafeAppData | undefined
  openPreviewDrawer: (safeApp: SafeAppData) => void
  closePreviewDrawer: () => void
}

const useSafeAppPreviewDrawer = (): ReturnType => {
  const [previewDrawerApp, setPreviewDrawerApp] = useState<SafeAppData>()
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState<boolean>(false)

  const openPreviewDrawer = (safeApp: SafeAppData) => {
    const isCustomApp = previewDrawerApp && previewDrawerApp.id < 1

    if (!isCustomApp) {
      setPreviewDrawerApp(safeApp)
      setIsPreviewDrawerOpen(true)
    }
  }

  const closePreviewDrawer = () => {
    setIsPreviewDrawerOpen(false)
  }

  return { isPreviewDrawerOpen, previewDrawerApp, openPreviewDrawer, closePreviewDrawer }
}

export default useSafeAppPreviewDrawer
