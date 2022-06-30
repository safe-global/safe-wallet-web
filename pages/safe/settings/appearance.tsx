import { Checkbox, FormControlLabel, FormGroup, Link, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import type { NextPage } from 'next'

import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setCopyShortName, setDarkMode, setShowShortName } from '@/store/settingsSlice'

const Appearance: NextPage = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)

  const handleShowShortName = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    dispatch(setShowShortName(checked))
  }
  const handleCopyShortName = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    dispatch(setCopyShortName(checked))
  }
  const handleDarkMode = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    dispatch(setDarkMode(checked))
  }
  return (
    <main>
      <Typography variant="h2">Settings / Appearance</Typography>
      <Typography variant="h4">Chain-specific addresses</Typography>
      <Typography>
        You can choose whether to prepend{' '}
        <Link href="https://eips.ethereum.org/EIPS/eip-3770" target="_blank" rel="noopener noreferrer">
          EIP-3770
        </Link>{' '}
        address prefixes across all Safes.
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={settings.shortName.show} onChange={handleShowShortName} />}
          label="Prepend addresses with chain prefix"
        />
        <FormControlLabel
          control={<Checkbox checked={settings.shortName.copy} onChange={handleCopyShortName} />}
          label="Copy addresses with chain prefix"
        />
      </FormGroup>
      <Typography variant="h4">Theme</Typography>
      <FormControlLabel
        control={<Checkbox checked={settings.theme.darkMode} onChange={handleDarkMode} disabled />}
        label="Dark mode"
      />
    </main>
  )
}

export default Appearance
