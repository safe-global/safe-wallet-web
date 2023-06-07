import { Checkbox, FormControlLabel, FormGroup, Grid, Paper, Typography, Switch, Tooltip, SvgIcon } from '@mui/material'
import type { ChangeEvent } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectSettings,
  setCopyShortName,
  setDarkMode,
  setShowShortName,
  setTransactionExecution,
} from '@/store/settingsSlice'
import SettingsHeader from '@/components/settings/SettingsHeader'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { useDarkMode } from '@/hooks/useDarkMode'
import ExternalLink from '@/components/common/ExternalLink'
import InfoIcon from '@/public/images/notifications/info.svg'

const Appearance: NextPage = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const isDarkMode = useDarkMode()

  const handleToggle = (
    action: typeof setCopyShortName | typeof setDarkMode | typeof setShowShortName | typeof setTransactionExecution,
    event:
      | typeof SETTINGS_EVENTS.APPEARANCE.PREPEND_PREFIXES
      | typeof SETTINGS_EVENTS.APPEARANCE.COPY_PREFIXES
      | typeof SETTINGS_EVENTS.APPEARANCE.DARK_MODE
      | typeof SETTINGS_EVENTS.APPEARANCE.TRANSACTION_EXECUTION,
  ) => {
    return (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      dispatch(action(checked))

      trackEvent({
        ...event,
        label: checked,
      })
    }
  }

  const infoIcon = (
    <Tooltip
      title={
        settings.transactionExecution
          ? 'The transaction will be by default executed when fully signed.'
          : 'If you want to sign the transaction by default and manually execute it later, uncheck this box.'
      }
    >
      <span>
        <SvgIcon
          component={InfoIcon}
          inheritViewBox
          fontSize="small"
          color="border"
          sx={{ verticalAlign: 'middle', marginLeft: 0.5 }}
        />
      </span>
    </Tooltip>
  )

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Appearance'}</title>
      </Head>

      <SettingsHeader />

      <main>
        <Paper sx={{ padding: 4 }}>
          <Grid container spacing={3}>
            <Grid item lg={4} xs={12}>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                Chain-specific addresses
              </Typography>
            </Grid>

            <Grid item xs>
              <Typography mb={2}>
                Choose whether to prepend{' '}
                <ExternalLink href="https://eips.ethereum.org/EIPS/eip-3770">EIP-3770</ExternalLink> address prefixes
                across all Safe Accounts.
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.shortName.show}
                      onChange={handleToggle(setShowShortName, SETTINGS_EVENTS.APPEARANCE.PREPEND_PREFIXES)}
                    />
                  }
                  label="Prepend chain prefix to addresses"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.shortName.copy}
                      onChange={handleToggle(setCopyShortName, SETTINGS_EVENTS.APPEARANCE.COPY_PREFIXES)}
                    />
                  }
                  label="Copy addresses with chain prefix"
                />
              </FormGroup>
            </Grid>
          </Grid>

          <Grid container alignItems="center" marginTop={2} spacing={3}>
            <Grid item lg={4} xs={12}>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                Transaction execution
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography mb={2}>
                {/* Change the default setting for last signer */}
                Choose execution behavior when the transaction is fully signed.
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.transactionExecution}
                      onChange={handleToggle(setTransactionExecution, SETTINGS_EVENTS.APPEARANCE.TRANSACTION_EXECUTION)}
                    />
                  }
                  label={<>Last signer executes transaction {infoIcon}</>}
                />
              </FormGroup>
            </Grid>
          </Grid>

          <Grid container alignItems="center" marginTop={2} spacing={3}>
            <Grid item lg={4} xs={12}>
              <Typography variant="h4" fontWeight="bold">
                Theme
              </Typography>
            </Grid>

            <Grid item xs>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDarkMode}
                    onChange={handleToggle(setDarkMode, SETTINGS_EVENTS.APPEARANCE.DARK_MODE)}
                  />
                }
                label="Dark mode"
              />
            </Grid>
          </Grid>
        </Paper>
      </main>
    </>
  )
}

export default Appearance
