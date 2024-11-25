import type { ReactElement } from 'react'
import { SvgIcon, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'
import ExternalLink from '../ExternalLink'
import MUILink from '@mui/material/Link'
import { HELP_CENTER_URL, IS_DEV, IS_OFFICIAL_HOST } from '@/config/constants'
import darkPalette from '@/components/theme/darkPalette'
import ProtofireLogo from '@/public/images/protofire-logo.svg'

const footerPages = [
  AppRoutes.welcome.index,
  AppRoutes.settings.index,
  AppRoutes.imprint,
  AppRoutes.privacy,
  AppRoutes.cookie,
  AppRoutes.terms,
  AppRoutes.licenses,
]

const Footer = (): ReactElement | null => {
  const router = useRouter()

  if (!footerPages.some((path) => router.pathname.startsWith(path))) {
    return null
  }

  return (
    <footer className={css.container}>
      <ul>
        {IS_OFFICIAL_HOST || IS_DEV ? (
          <>
            <li>
              <ExternalLink href={HELP_CENTER_URL} noIcon sx={{ span: { textDecoration: 'underline' } }}>
                Help
              </ExternalLink>
            </li>
            <li>
              <Typography variant="caption">
                Supported by{' '}
                <SvgIcon
                  component={ProtofireLogo}
                  inheritViewBox
                  fontSize="small"
                  sx={{ verticalAlign: 'middle', mx: 0.5 }}
                />
                <MUILink href="https://protofire.io" sx={{ color: darkPalette.primary.main, textDecoration: 'none' }}>
                  Protofire
                </MUILink>
              </Typography>
            </li>
          </>
        ) : (
          <li>{'This is an unofficial distribution of Safe{Wallet}'}</li>
        )}
      </ul>
    </footer>
  )
}

export default Footer
