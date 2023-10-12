import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { Grid, Typography, Divider, FormControlLabel, Checkbox, SvgIcon, IconButton, Tooltip } from '@mui/material'
import type { SessionTypes } from '@walletconnect/types'
import type { ReactElement } from 'react'

import { Hints } from '../Hints'
import SessionList from '../SessionList'
import WcInput from '../WcInput'
import InfoIcon from '@/public/images/notifications/info.svg'
import { WalletConnectHeader } from '../SessionManager/Header'

import css from './styles.module.css'

const WC_HINTS_KEY = 'wcHints'

export const ConnectionForm = ({
  sessions,
  onDisconnect,
}: {
  sessions: SessionTypes.Struct[]
  onDisconnect: (session: SessionTypes.Struct) => Promise<void>
}): ReactElement => {
  const [hideHints = false, setHideHints] = useLocalStorage<boolean>(WC_HINTS_KEY)

  return (
    <Grid className={css.container}>
      <Grid item textAlign="center">
        <Tooltip
          title="How does WalletConnect work?"
          hidden={!hideHints}
          placement="top"
          arrow
          className={css.infoIcon}
        >
          <span>
            <IconButton onClick={() => setHideHints(false)}>
              <SvgIcon component={InfoIcon} inheritViewBox color="border" />
            </IconButton>
          </span>
        </Tooltip>

        <WalletConnectHeader />

        <Typography variant="body2" color="text.secondary" mb={3}>
          Connnect your Safe to any dApp via WalletConnect and trigger transactions
        </Typography>

        <WcInput />
      </Grid>

      <Divider flexItem className={css.divider} />

      <Grid item>
        <SessionList sessions={sessions} onDisconnect={onDisconnect} />
      </Grid>

      {!hideHints && (
        <>
          <Divider flexItem className={css.divider} />

          <Grid item>
            <Hints />

            <FormControlLabel
              control={<Checkbox checked={hideHints} onChange={(_, checked) => setHideHints(checked)} />}
              label="Don't show this anymore"
              sx={{ mt: 1 }}
            />
          </Grid>
        </>
      )}
    </Grid>
  )
}
