import { Checkbox, FormControlLabel, FormGroup, Grid, Paper, Typography, Switch } from '@mui/material'
import type { ChangeEvent } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectSettings,
  setCopyShortName,
  setDarkMode,
  setShowShortName,
  setAddressEmojis,
} from '@/store/settingsSlice'
import SettingsHeader from '@/components/settings/SettingsHeader'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { useDarkMode } from '@/hooks/useDarkMode'
import ExternalLink from '@/components/common/ExternalLink'
import PrefixedEthHashInfo from '@/components/common/EthHashInfo'

const Appearance: NextPage = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const isDarkMode = useDarkMode()

  const handleToggle = (
    action: typeof setCopyShortName | typeof setDarkMode | typeof setShowShortName | typeof setAddressEmojis,
    event:
      | typeof SETTINGS_EVENTS.APPEARANCE.PREPEND_PREFIXES
      | typeof SETTINGS_EVENTS.APPEARANCE.COPY_PREFIXES
      | typeof SETTINGS_EVENTS.APPEARANCE.DARK_MODE
      | typeof SETTINGS_EVENTS.APPEARANCE.ADDRESS_EMOJIS,
  ) => {
    return (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      dispatch(action(checked))

      trackEvent({
        ...event,
        label: checked,
      })
    }
  }

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

          <Grid container alignItems="center" marginTop={2} spacing={3}>
            <Grid item lg={4} xs={12}>
              <Typography variant="h4" fontWeight="bold">
                Experimental
              </Typography>
            </Grid>

            <Grid item xs>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.addressEmojis}
                        onChange={handleToggle(setAddressEmojis, SETTINGS_EVENTS.APPEARANCE.ADDRESS_EMOJIS)}
                      />
                    }
                    label="Enable address emojis"
                  />
                </Grid>

                <Grid item>
                  <Typography color="border.main">Preview:</Typography>
                </Grid>
                <Grid item xs>
                  <PrefixedEthHashInfo address="0x0000000000000000000000000000000000000000" />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </main>
    </>
  )
}

export default Appearance
