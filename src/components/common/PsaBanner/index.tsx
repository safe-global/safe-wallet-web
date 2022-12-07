import type { ReactElement, ReactNode } from 'react'
import { isEmpty } from 'lodash'
import type { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { hasFeature } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useRouter } from 'next/router'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import { useAppDispatch, useAppSelector } from '@/store'
import { useEffect } from 'react'
import { showNotification } from '@/store/notificationsSlice'

const WARNING_BANNER = 'WARNING_BANNER'
const OLD_APP = 'https://gnosis-safe.io/app'

const ExportLink = ({ children }: { children: ReactNode }): ReactElement => {
  const router = useRouter()
  const safeAddress = router.query.safe as string
  const url = safeAddress ? `${OLD_APP}/${safeAddress}/settings/details` : `${OLD_APP}/export`

  return (
    <a href={url} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

const BANNERS: Record<string, ReactElement | string> = {
  '*': (
    <>
      <b>app.safe.global</b> is Safe&apos;s new official URL. Export your data from the old app{' '}
      <ExportLink>here</ExportLink>.
    </>
  ),
}

const PsaBanner = (): null => {
  const dispatch = useAppDispatch()
  const chain = useCurrentChain()
  const banner = chain ? BANNERS[chain.chainId] || BANNERS['*'] : undefined
  const isEnabled = chain && hasFeature(chain, WARNING_BANNER as FEATURES)
  const [closed = false, setClosed] = useLocalStorage<boolean>(`${WARNING_BANNER}_closed`)

  // Address books on all chains
  const ab = useAppSelector(selectAllAddressBooks)

  const showBanner = !!isEnabled && !!banner && !closed && isEmpty(ab)

  useEffect(() => {
    if (!showBanner) return

    dispatch(
      showNotification({
        message: banner,
        variant: 'info',
        groupKey: 'psa-banner',
        autoHide: false,
        isBanner: true,
        onClose: () => setClosed(true),
      }),
    )
  }, [banner, dispatch, setClosed, showBanner])

  return null
}

export default PsaBanner
