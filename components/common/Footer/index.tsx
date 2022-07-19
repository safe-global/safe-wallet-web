import { SyntheticEvent, ReactElement } from 'react'
import { Link } from '@mui/material'
import { useRouter } from 'next/router'
import css from './styles.module.css'
import { useAppDispatch } from '@/store'
import { openCookieBanner } from '@/store/popupSlice'
import { AppRoutes } from '@/config/routes'
import packageJson from '../../../package.json'

const footerPages = [
  AppRoutes.welcome,
  AppRoutes.safe.settings.index,
  AppRoutes.safe.settings.setup,
  AppRoutes.safe.settings.modules,
  AppRoutes.safe.settings.appearance,
]

const Footer = (): ReactElement | null => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  if (!footerPages.includes(router.pathname)) {
    return null
  }

  const onCookieClick = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(openCookieBanner({}))
  }

  return (
    <div className={css.container}>
      <ul>
        <li>&copy;2022 Safe Foundation</li>
        <li>
          <Link rel="noopener noreferrer" target="_blank" href="https://gnosis-safe.io/terms">
            Terms
          </Link>
        </li>
        <li>
          <Link rel="noopener noreferrer" target="_blank" href="https://gnosis-safe.io/privacy">
            Privacy
          </Link>
        </li>
        <li>
          <Link rel="noopener noreferrer" target="_blank" href="https://gnosis-safe.io/licenses">
            Licenses
          </Link>
        </li>
        <li>
          <Link rel="noopener noreferrer" target="_blank" href="https://gnosis-safe.io/imprint">
            Imprint
          </Link>
        </li>
        <li>
          <Link rel="noopener noreferrer" target="_blank" href="https://gnosis-safe.io/cookie">
            Cookie Policy
          </Link>
          &nbsp;&mdash;&nbsp;
          <Link href="#" onClick={onCookieClick}>
            Preferences
          </Link>
        </li>
        <li>
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href={`${packageJson.homepage}/releases/tags/${packageJson.version}`}
          >
            v{packageJson.version}
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Footer
