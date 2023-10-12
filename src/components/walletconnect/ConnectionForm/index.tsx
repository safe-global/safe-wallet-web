import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { Grid, Typography, Divider, FormControlLabel, Checkbox, SvgIcon, IconButton, Tooltip } from '@mui/material'
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { SessionTypes } from '@walletconnect/types'

import { Hints } from '../Hints'
import SessionList from '../SessionList'
import WcInput from '../WcInput'
import InfoIcon from '@/public/images/notifications/info.svg'
import { WalletConnectHeader } from '../SessionManager/Header'
import useDebounce from '@/hooks/useDebounce'

import css from './styles.module.css'

const WC_HINTS_KEY = 'wcHints'

export const ConnectionForm = ({
  sessions,
  onDisconnect,
}: {
  sessions: SessionTypes.Struct[]
  onDisconnect: (session: SessionTypes.Struct) => Promise<void>
}): ReactElement => {
  const [dismissedHints = false, setDismissedHints] = useLocalStorage<boolean>(WC_HINTS_KEY)
  const debouncedHideHints = useDebounce(dismissedHints, 300)
  const [showHints, setShowHints] = useState(dismissedHints)

  const onToggle = () => {
    setShowHints((prev) => !prev)
  }

  const onHide = () => {
    setDismissedHints(true)
    setShowHints(false)
  }

  return (
    <Grid className={css.container}>
      <Grid item textAlign="center">
        <Tooltip
          title="How does WalletConnect work?"
          hidden={!debouncedHideHints}
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
          Paste the pairing URI below to connect to your {`Safe{Wallet}`} via WalletConnect
        </Typography>

        <WcInput />
      </Grid>

      <Divider flexItem className={css.divider} />

      <Grid item>
        <SessionList sessions={sessions} onDisconnect={onDisconnect} />
      </Grid>

      {(!debouncedHideHints || showHints) && (
        <>
          <Divider flexItem className={css.divider} />

          <Grid item>
            <Hints />

            {!debouncedHideHints && (
              <FormControlLabel
                control={<Checkbox checked={dismissedHints} onChange={onHide} />}
                label="Don't show this anymore"
                sx={{ mt: 1 }}
              />
            )}
          </Grid>
        </>
      )}
    </Grid>
  )
}
