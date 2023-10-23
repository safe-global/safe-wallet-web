import { useCallback, useEffect } from 'react'
import { Grid, Typography, Divider, SvgIcon, IconButton, Tooltip } from '@mui/material'
import type { ReactElement } from 'react'
import type { SessionTypes } from '@walletconnect/types'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import InfoIcon from '@/public/images/notifications/info.svg'
import WcHints from '../WcHints'
import WcSessionList from '../WcSessionList'
import WcInput from '../WcInput'
import WcLogoHeader from '../WcLogoHeader'
import css from './styles.module.css'
import useSafeAddress from '@/hooks/useSafeAddress'

const WC_HINTS_KEY = 'wcHints'

export const WcConnectionForm = ({
  sessions,
  onDisconnect,
  uri,
}: {
  sessions: SessionTypes.Struct[]
  onDisconnect: (session: SessionTypes.Struct) => Promise<void>
  uri: string
}): ReactElement => {
  const [showHints = true, setShowHints] = useLocalStorage<boolean>(WC_HINTS_KEY)
  const safeAddress = useSafeAddress()

  const onToggle = useCallback(() => {
    setShowHints((prev) => !prev)
  }, [setShowHints])

  useEffect(() => {
    return () => setShowHints(false)
  }, [setShowHints])

  return (
    <Grid className={css.container}>
      <Grid item textAlign="center">
        <Tooltip
          title={showHints ? 'Hide how WalletConnect works' : 'How does WalletConnect work?'}
          placement="top"
          arrow
          className={css.infoIcon}
        >
          <span>
            <IconButton onClick={onToggle}>
              <SvgIcon component={InfoIcon} inheritViewBox color="border" />
            </IconButton>
          </span>
        </Tooltip>

        <WcLogoHeader />

        <Typography variant="body2" color="text.secondary" mb={3}>
          Paste the pairing code below to connect to your {`Safe{Wallet}`} via WalletConnect
        </Typography>

        <WcInput uri={uri} disabled={!safeAddress} />
      </Grid>

      <Divider flexItem className={css.divider} />

      <Grid item>
        <WcSessionList sessions={sessions} onDisconnect={onDisconnect} />
      </Grid>

      {showHints && (
        <>
          <Divider flexItem className={css.divider} />

          <Grid item mt={1}>
            <WcHints />
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default WcConnectionForm
