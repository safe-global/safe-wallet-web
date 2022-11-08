import type { ReactElement, ReactNode } from 'react'
import { isEmpty } from 'lodash'
import type { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import styles from './index.module.css'
import { hasFeature } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useRouter } from 'next/router'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import { useAppSelector } from '@/store'

const WARNING_BANNER = 'WARNING_BANNER'
const OLD_APP = 'https://gnosis-safe.io/app'
const NO_REDIRECT = '?no-redirect=true'

const ExportLink = ({ children }: { children: ReactNode }): ReactElement => {
  const router = useRouter()
  const safeAddress = router.query.safe as string
  const url = safeAddress ? `${OLD_APP}/${safeAddress}/address-book${NO_REDIRECT}` : `${OLD_APP}${NO_REDIRECT}`

  return (
    <a href={url} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

const BANNERS: Record<string, ReactElement | string> = {
  '*': (
    <>
      <b>app.safe.global</b> is Safe&apos;s new official URL.
      <br />
      Import your address book via the CSV export from the <ExportLink>old app</ExportLink>.
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
