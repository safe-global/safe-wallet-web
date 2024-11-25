import type { ReactElement } from 'react'
import { useEffect } from 'react'

import {
  SidebarList,
  SidebarListItemButton,
  SidebarListItemIcon,
  SidebarListItemText,
} from '@/components/sidebar/SidebarList'
import { BEAMER_SELECTOR, loadBeamer } from '@/services/beamer'
import { useAppSelector } from '@/store'
import { CookieAndTermType, hasConsentFor } from '@/store/cookiesAndTermsSlice'
import { Link, ListItem, SvgIcon, Typography } from '@mui/material'
import DebugToggle from '../DebugToggle'
import { IS_PRODUCTION, NEW_SUGGESTION_FORM } from '@/config/constants'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import { useCurrentChain } from '@/hooks/useChains'
import ProtofireLogo from '@/public/images/protofire-logo.svg'
import SuggestionIcon from '@/public/images/sidebar/lightbulb_icon.svg'
import darkPalette from '@/components/theme/darkPalette'

const SidebarFooter = (): ReactElement => {
  const chain = useCurrentChain()
  const hasBeamerConsent = useAppSelector((state) => hasConsentFor(state, CookieAndTermType.UPDATES))

  useEffect(() => {
    // Initialise Beamer when consent was previously given
    if (hasBeamerConsent && chain?.shortName) {
      loadBeamer(chain.shortName)
    }
  }, [hasBeamerConsent, chain?.shortName])

  return (
    <SidebarList>
      {!IS_PRODUCTION && (
        <ListItem disablePadding>
          <DebugToggle />
        </ListItem>
      )}

      {/* <Track {...OVERVIEW_EVENTS.WHATS_NEW}>
        <ListItem disablePadding>
          <SidebarListItemButton id={BEAMER_SELECTOR} onClick={handleBeamer}>
            <SidebarListItemIcon color="primary">
              <BeamerIcon />
            </SidebarListItemIcon>
            <SidebarListItemText data-testid="list-item-whats-new" bold>
              What&apos;s new
            </SidebarListItemText>
          </SidebarListItemButton>
        </ListItem>
      </Track> */}

      <Track {...OVERVIEW_EVENTS.SUGGESTIONS}>
        <ListItem disablePadding>
          <a target="_blank" rel="noopener noreferrer" href={NEW_SUGGESTION_FORM} style={{ width: '100%' }}>
            <SidebarListItemButton id={BEAMER_SELECTOR} style={{ backgroundColor: '#12FF80', color: 'black' }}>
              <SidebarListItemIcon color="primary">
                <SuggestionIcon />
              </SidebarListItemIcon>
              <SidebarListItemText bold>New Features Suggestion?</SidebarListItemText>
            </SidebarListItemButton>
          </a>
        </ListItem>
      </Track>
      <ListItem>
        <SidebarListItemText>
          <Typography variant="caption">
            Supported by{' '}
            <SvgIcon
              component={ProtofireLogo}
              inheritViewBox
              fontSize="small"
              sx={{ verticalAlign: 'middle', mx: 0.5 }}
            />
            <Link href="https://protofire.io" sx={{ color: darkPalette.primary.main, textDecoration: 'none' }}>
              Protofire
            </Link>
          </Typography>
        </SidebarListItemText>
      </ListItem>
    </SidebarList>
  )
}

export default SidebarFooter
