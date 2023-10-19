import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { Grid, Typography, Divider, SvgIcon, IconButton, Tooltip } from '@mui/material'
import { useCallback, useContext, useEffect } from 'react'
import type { ReactElement } from 'react'
import type { SessionTypes } from '@walletconnect/types'

import { Hints } from '../Hints'
import SessionList from '../SessionList'
import WcInput from '../WcInput'
import InfoIcon from '@/public/images/notifications/info.svg'
import { WalletConnectHeader } from '../SessionManager/Header'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'

import css from './styles.module.css'

const WC_HINTS_KEY = 'wcHints'

export const ConnectionForm = ({
  sessions,
  onDisconnect,
  uri,
}: {
  sessions: SessionTypes.Struct[]
  onDisconnect: (session: SessionTypes.Struct) => Promise<void>
  uri: string
}): ReactElement => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [showHints = false, setShowHints] = useLocalStorage<boolean>(WC_HINTS_KEY)

  const onToggle = () => {
    setShowHints((prev) => !prev)
  }

  const onHide = useCallback(() => {
    setShowHints(false)
  }, [setShowHints])

  useEffect(() => {
    if (!walletConnect) {
      return
    }

    return walletConnect.onSessionPropose(onHide)
  }, [onHide, walletConnect])

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

        <WalletConnectHeader />

        <Typography variant="body2" color="text.secondary" mb={3}>
          Paste the pairing code below to connect to your {`Safe{Wallet}`} via WalletConnect
        </Typography>

        <WcInput uri={uri} />
      </Grid>

      <Divider flexItem className={css.divider} />

      <Grid item>
        <SessionList sessions={sessions} onDisconnect={onDisconnect} />
      </Grid>

      {showHints && (
        <>
          <Divider flexItem className={css.divider} />

          <Grid item mt={1}>
            <Hints />
          </Grid>
        </>
      )}
    </Grid>
  )
}
