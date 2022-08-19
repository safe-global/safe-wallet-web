import { SyntheticEvent, ReactElement } from 'react'
import { Link, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import css from './styles.module.css'
import { useAppDispatch } from '@/store'
import { openCookieBanner } from '@/store/popupSlice'
import { AppRoutes } from '@/config/routes'
import packageJson from '../../../../package.json'

const footerPages = [AppRoutes.welcome, AppRoutes.safe.settings.index]

const Footer = (): ReactElement | null => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  if (!footerPages.some((path) => router.pathname.startsWith(path))) {
    return null
  }

  const onCookieClick = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(openCookieBanner({}))
  }

  return (
    <footer className={css.container}>
      <ul>
        <li>
          <Typography variant="caption">&copy;2022 Safe Foundation</Typography>
        </li>
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
    </footer>
  )
}

export default Footer
