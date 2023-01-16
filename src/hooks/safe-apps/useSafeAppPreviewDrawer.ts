import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { useState } from 'react'

type ReturnType = {
  safeApp: SafeAppData | undefined
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  setSafeApp: (safeApp: SafeAppData) => void
}

const useSafeAppPreviewDrawer = (): ReturnType => {
  const [safeApp, setSafeApp] = useState<SafeAppData>()
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return { safeApp, isOpen, setIsOpen, setSafeApp }
}

export default useSafeAppPreviewDrawer
