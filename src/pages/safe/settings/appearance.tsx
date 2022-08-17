import { Checkbox, FormControlLabel, FormGroup, Grid, Link, Paper, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setCopyShortName, setDarkMode, setShowShortName } from '@/store/settingsSlice'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import SettingsIcon from '@/public/images/sidebar/settings.svg'
import { trackEvent } from '@/services/analytics/analytics'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'

const Appearance: NextPage = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)

  const handleToggle = (
    action: typeof setCopyShortName | typeof setDarkMode | typeof setShowShortName,
    event:
      | typeof SETTINGS_EVENTS.APPEARANCE.PREPEND_PREFIXES
      | typeof SETTINGS_EVENTS.APPEARANCE.COPY_PREFIXES
      | typeof SETTINGS_EVENTS.APPEARANCE.DARK_MODE,
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
    <main>
      <Head>
        <title>Safe – Settings – Appearance</title>
      </Head>

      <Breadcrumbs Icon={SettingsIcon} first="Settings" second="Appearance" />

      <Paper sx={{ padding: 4 }} variant="outlined">
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Chain-specific addresses
            </Typography>
          </Grid>

          <Grid item xs>
            <Typography mb={2}>
              You can choose whether to prepend{' '}
              <Link href="https://eips.ethereum.org/EIPS/eip-3770" target="_blank" rel="noopener noreferrer">
                EIP-3770
              </Link>{' '}
              address prefixes across all Safes.
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
                    onChange={handleToggle(setShowShortName, SETTINGS_EVENTS.APPEARANCE.COPY_PREFIXES)}
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
                <Checkbox
                  checked={settings.theme.darkMode}
                  onChange={handleToggle(setShowShortName, SETTINGS_EVENTS.APPEARANCE.DARK_MODE)}
                />
              }
              label="Dark mode"
            />
          </Grid>
        </Grid>
      </Paper>
    </main>
  )
}

export default Appearance
