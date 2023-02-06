import type { ReactElement, ReactNode } from 'react'
import { useEffect } from 'react'
import { isEmpty } from 'lodash'
import type { FEATURES } from '@safe-global/safe-gateway-typescript-sdk'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import styles from './index.module.css'
import { hasFeature } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import { useAppSelector } from '@/store'

const WARNING_BANNER = 'WARNING_BANNER'
const OLD_APP = 'https://gnosis-safe.io/app'

const ExportLink = ({ children }: { children: ReactNode }): ReactElement => {
  const url = `${OLD_APP}/export`

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

const PsaBanner = (): ReactElement | null => {
  const chain = useCurrentChain()
  const banner = chain ? BANNERS[chain.chainId] || BANNERS['*'] : undefined
  const isEnabled = chain && hasFeature(chain, WARNING_BANNER as FEATURES)
  const [closed = false, setClosed] = useLocalStorage<boolean>(`${WARNING_BANNER}_closed`)

  // Address books on all chains
  const ab = useAppSelector(selectAllAddressBooks)

  const showBanner = Boolean(isEnabled && banner && !closed && isEmpty(ab))

  const onClose = () => {
    setClosed(true)
  }

  useEffect(() => {
    const className = 'psaBanner'
    document.documentElement.classList?.toggle(className, showBanner)
    return () => document.documentElement.classList?.remove(className)
  }, [showBanner])

  return showBanner ? (
    <div className={styles.banner}>
      <div className={styles.wrapper}>
        <div className={styles.content}>{banner}</div>

        <IconButton className={styles.close} onClick={onClose} aria-label="dismiss announcement banner">
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  ) : null
}

export default PsaBanner
