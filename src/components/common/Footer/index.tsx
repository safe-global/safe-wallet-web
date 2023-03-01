import type { SyntheticEvent, ReactElement } from 'react'
import { Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import css from './styles.module.css'
import { useAppDispatch } from '@/store'
import { openCookieBanner } from '@/store/popupSlice'
import { AppRoutes } from '@/config/routes'
import packageJson from '../../../../package.json'
import AppstoreButton from '../AppStoreButton'
import ExternalLink from '../ExternalLink'
import MUILink from '@mui/material/Link'

const footerPages = [
  AppRoutes.welcome,
  AppRoutes.settings.index,
  AppRoutes.imprint,
  AppRoutes.privacy,
  AppRoutes.cookie,
]

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
          <Typography variant="caption">&copy;2022–{new Date().getFullYear()} Safe Ecosystem Foundation</Typography>
        </li>
        <li>
          <ExternalLink noIcon href="https://safe.global/terms">
            Terms
          </ExternalLink>
        </li>
        <li>
          <Link href={AppRoutes.privacy} passHref>
            <MUILink>Privacy</MUILink>
          </Link>
        </li>
        <li>
          <ExternalLink noIcon href="https://safe.global/licenses">
            Licenses
          </ExternalLink>
        </li>
        <li>
          <Link href={AppRoutes.imprint} passHref>
            <MUILink>Imprint</MUILink>
          </Link>
        </li>
        <li>
          <Link href={AppRoutes.cookie} passHref>
            <MUILink>Cookie Policy</MUILink>
          </Link>
          &nbsp;&mdash;&nbsp;
          <MUILink href="#" onClick={onCookieClick}>
            Preferences
          </MUILink>
        </li>
        <li>
          <ExternalLink noIcon href={`${packageJson.homepage}/releases/tag/v${packageJson.version}`}>
            v{packageJson.version}
          </ExternalLink>
        </li>
        <li>
          <AppstoreButton placement="footer" />
        </li>
      </ul>
    </footer>
  )
}

export default Footer
